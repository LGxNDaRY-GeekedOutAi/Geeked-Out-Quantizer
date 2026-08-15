/**
 * Quantization Engine
 * 
 * Core quantization logic that interfaces with llama.cpp
 * Handles model loading, quantization, and progress tracking
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../shared/logger';
import { QuantizationParams, QuantizationStatus, QuantizationProgress } from './types';

export class QuantizationEngine {
  private currentProcess: ChildProcess | null = null;
  private isCancelled = false;
  private currentStatus: QuantizationStatus = {
    state: 'idle',
    progress: 0,
    eta: null,
    currentStep: '',
    totalSteps: 0,
    currentStepIndex: 0,
  };

  /**
   * Execute quantization
   */
  async quantize(params: QuantizationParams): Promise<any> {
    this.isCancelled = false;
    this.updateStatus('running', 'Initializing quantization...');

    const { modelPath, quantType, outputDir, threads, batchSize, contextSize, useCuda, cudaDevice } = params;

    // Validate input
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file not found: ${modelPath}`);
    }

    // Create output directory if needed
    if (outputDir && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Determine output path
    const modelName = path.basename(modelPath, '.gguf');
    const outputPath = outputDir
      ? path.join(outputDir, `${modelName}_${quantType}.gguf`)
      : `${modelName}_${quantType}.gguf`;

    this.updateStatus('running', `Starting ${quantType} quantization...`, 1, 1);

    // Build llama.cpp quantize command
    const llamaCppPath = this.getLlamaCppPath();
    const args = [
      '-m', modelPath,
      '-q', quantType,
      '-o', outputPath,
      '--threads', String(threads || 0),
      '--batch-size', String(batchSize || 512),
      '--ctx-size', String(contextSize || 4096),
    ];

    if (useCuda) {
      args.push('--cuda');
      if (cudaDevice !== undefined) {
        args.push('--cuda-device', String(cudaDevice));
      }
    }

    if (params.imatrix) {
      args.push('--imatrix', params.imatrix);
    }

    Logger.info(`Executing: ${llamaCppPath} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      this.currentProcess = spawn(llamaCppPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      this.currentProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        this.parseProgress(text);
        Logger.debug(`[quantize] ${text.trim()}`);
      });

      this.currentProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        Logger.error(`[quantize] ${text.trim()}`);
      });

      this.currentProcess.on('close', (code) => {
        this.currentProcess = null;

        if (this.isCancelled) {
          this.updateStatus('cancelled', 'Quantization cancelled');
          reject(new Error('Quantization cancelled'));
          return;
        }

        if (code === 0) {
          this.updateStatus('completed', 'Quantization complete!');
          resolve({ outputPath, output });
        } else {
          this.updateStatus('error', `Quantization failed with code ${code}`);
          reject(new Error(`Quantization failed: ${errorOutput}`));
        }
      });

      this.currentProcess.on('error', (error) => {
        this.currentProcess = null;
        this.updateStatus('error', error.message);
        reject(error);
      });
    });
  }

  /**
   * Generate importance matrix (imatrix)
   */
  async generateImatrix(params: {
    modelPath: string;
    corpusPath: string;
    outputPath: string;
    ntokens: number;
    threads: number;
  }): Promise<any> {
    const { modelPath, corpusPath, outputPath, ntokens, threads } = params;

    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file not found: ${modelPath}`);
    }

    if (!fs.existsSync(corpusPath)) {
      throw new Error(`Corpus file not found: ${corpusPath}`);
    }

    const llamaCppPath = this.getLlamaCppPath();
    const args = [
      '-m', modelPath,
      '-f', corpusPath,
      '--imatrix', outputPath,
      '-ngl', '99',
      '--threads', String(threads || 0),
      '-n', String(ntokens || 128000),
    ];

    Logger.info(`Generating imatrix: ${llamaCppPath} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const process = spawn(llamaCppPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
        Logger.debug(`[imatrix] ${data.toString().trim()}`);
      });

      process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
        Logger.error(`[imatrix] ${data.toString().trim()}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ outputPath, output });
        } else {
          reject(new Error(`imatrix generation failed: ${errorOutput}`));
        }
      });

      process.on('error', reject);
    });
  }

  /**
   * Cancel current quantization
   */
  cancel(): void {
    this.isCancelled = true;
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
    }
  }

  /**
   * Get current status
   */
  getStatus(): QuantizationStatus {
    return { ...this.currentStatus };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
    }
  }

  /**
   * Update status
   */
  private updateStatus(
    state: QuantizationStatus['state'],
    currentStep: string,
    totalSteps = 0,
    currentStepIndex = 0
  ): void {
    this.currentStatus = {
      ...this.currentStatus,
      state,
      currentStep,
      totalSteps,
      currentStepIndex,
      progress: state === 'completed' ? 100 : state === 'error' || state === 'cancelled' ? this.currentStatus.progress : this.currentStatus.progress,
    };
  }

  /**
   * Parse progress from llama.cpp output
   */
  private parseProgress(text: string): void {
    // Parse progress lines like: "progress =  50.0%"
    const progressMatch = text.match(/progress\s*=\s*([\d.]+)%/);
    if (progressMatch) {
      const progress = parseFloat(progressMatch[1]);
      this.currentStatus.progress = progress;
      this.currentStatus.eta = this.calculateETA(progress);
    }

    // Parse step info
    const stepMatch = text.match(/step\s*=\s*(\d+)\/(\d+)/);
    if (stepMatch) {
      this.currentStatus.currentStepIndex = parseInt(stepMatch[1]);
      this.currentStatus.totalSteps = parseInt(stepMatch[2]);
    }
  }

  /**
   * Calculate ETA based on progress
   */
  private calculateETA(progress: number): number | null {
    if (progress === 0 || progress === 100) return null;
    // Simple ETA calculation - would be more sophisticated in production
    return Math.round((100 - progress) / progress * 60); // seconds
  }

  /**
   * Get path to llama.cpp quantize binary
   */
  private getLlamaCppPath(): string {
    // Check for CUDA build first
    const cudaPath = path.join(__dirname, '..', '..', 'bin', 'llama-quantize-cuda.exe');
    if (fs.existsSync(cudaPath)) {
      return cudaPath;
    }

    // Fall back to CPU build
    const cpuPath = path.join(__dirname, '..', '..', 'bin', 'llama-quantize.exe');
    if (fs.existsSync(cpuPath)) {
      return cpuPath;
    }

    // Check system path
    return 'llama-quantize';
  }
}
