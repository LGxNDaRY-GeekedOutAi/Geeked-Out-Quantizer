/**
 * Hardware Detection Module
 * 
 * Detects CPU, GPU, and memory information
 * Provides recommendations for quantization parameters
 */

import * as si from 'systeminformation';
import { CPUDetection, GPUDetection, MemoryDetection } from '../quantization/types';
import { Logger } from '../shared/logger';

export class HardwareDetector {
  private cpuInfo: CPUDetection | null = null;
  private gpuInfo: GPUDetection | null = null;
  private memoryInfo: MemoryDetection | null = null;

  /**
   * Detect all hardware
   */
  async detectAll(): Promise<any> {
    const [cpu, gpu, memory] = await Promise.all([
      this.detectCPU(),
      this.detectGPU(),
      this.detectMemory(),
    ]);

    return { cpu, gpu, memory };
  }

  /**
   * Detect CPU information
   */
  async detectCPU(): Promise<CPUDetection> {
    if (this.cpuInfo) return this.cpuInfo;

    try {
      const cpu = await si.cpu();
      const cpuCount = await si.cpuCount();

      // Detect DDR5 (heuristic based on memory type)
      const mem = await si.mem();
      const isDDR5 = mem.type?.includes('DDR5') || false;

      // Calculate recommended threads
      const physicalCores = cpu.cores || 4;
      const recommendedThreads = Math.min(physicalCores, 32);

      this.cpuInfo = {
        cores: physicalCores,
        logicalCores: cpuCount || physicalCores,
        model: cpu.manufacturer ? `${cpu.manufacturer} ${cpu.brand}` : cpu.vendor || 'Unknown',
        architecture: cpu.vendor || 'x64',
        vendor: cpu.vendor || 'Unknown',
        isDDR5,
        recommendedThreads,
      };

      Logger.info(`CPU detected: ${this.cpuInfo.model} (${physicalCores} cores)`);
      return this.cpuInfo;
    } catch (error) {
      Logger.error('CPU detection failed:', error);
      return this.getDefaultCPU();
    }
  }

  /**
   * Detect GPU information
   */
  async detectGPU(): Promise<GPUDetection | null> {
    if (this.gpuInfo) return this.gpuInfo;

    try {
      const gpu = await si.graphics();

      if (!gpu.controllers || gpu.controllers.length === 0) {
        this.gpuInfo = null;
        return null;
      }

      const controller = gpu.controllers[0];
      const vramGB = Math.round((controller.vram || 0) / 1024);

      // Check for CUDA
      const cuda = await si.cuda();
      const hasCuda = cuda.devices && cuda.devices.length > 0;
      const cudaVersion = hasCuda ? cuda.driverVersion || 'Unknown' : 'N/A';

      // Determine compute capability
      const computeCap = this.getComputeCapability(controller.vendor, controller.model);

      this.gpuInfo = {
        name: controller.model || 'Unknown GPU',
        vendor: controller.vendor || 'Unknown',
        vram: vramGB,
        cudaVersion,
        computeCapability: computeCap,
        recommended: this.isGPURecommended(controller),
      };

      Logger.info(`GPU detected: ${this.gpuInfo.name} (${vramGB}GB VRAM)`);
      return this.gpuInfo;
    } catch (error) {
      Logger.error('GPU detection failed:', error);
      return null;
    }
  }

  /**
   * Detect memory information
   */
  async detectMemory(): Promise<MemoryDetection> {
    if (this.memoryInfo) return this.memoryInfo;

    try {
      const mem = await si.mem();
      const memLayout = await si.memLayout();

      const totalGB = Math.round(mem.total / (1024 * 1024 * 1024));
      const availableGB = Math.round(mem.available / (1024 * 1024 * 1024));
      const memType = mem.type || 'Unknown';
      const speed = mem.speed || 0;

      // Calculate recommended batch size based on RAM
      const recommendedBatchSize = this.calculateRecommendedBatchSize(totalGB, memType);
      const recommendedContextSize = this.calculateRecommendedContextSize(totalGB);

      this.memoryInfo = {
        total: totalGB,
        available: availableGB,
        type: memType,
        speed,
        recommendedBatchSize,
        recommendedContextSize,
      };

      Logger.info(`Memory detected: ${totalGB}GB ${memType} (${speed}MHz)`);
      return this.memoryInfo;
    } catch (error) {
      Logger.error('Memory detection failed:', error);
      return this.getDefaultMemory();
    }
  }

  /**
   * Calculate recommended batch size
   */
  private calculateRecommendedBatchSize(totalGB: number, memType: string): number {
    if (totalGB >= 64) return 2048;
    if (totalGB >= 32) return 1024;
    if (totalGB >= 16) return 512;
    return 256;
  }

  /**
   * Calculate recommended context size
   */
  private calculateRecommendedContextSize(totalGB: number): number {
    if (totalGB >= 64) return 8192;
    if (totalGB >= 32) return 4096;
    if (totalGB >= 16) return 2048;
    return 1024;
  }

  /**
   * Get compute capability based on GPU vendor and model
   */
  private getComputeCapability(vendor: string, model: string): string {
    if (vendor?.includes('NVIDIA')) {
      if (model?.includes('RTX 40')) return '8.9';
      if (model?.includes('RTX 30')) return '8.6';
      if (model?.includes('RTX 20')) return '7.5';
      if (model?.includes('RTX')) return '7.0';
      return '6.0';
    }
    return 'Unknown';
  }

  /**
   * Check if GPU is recommended for quantization
   */
  private isGPURecommended(controller: any): boolean {
    if (!controller?.vendor?.includes('NVIDIA')) return false;
    const vram = controller.vram || 0;
    return vram >= 8 * 1024 * 1024 * 1024; // 8GB+
  }

  /**
   * Get default CPU info
   */
  private getDefaultCPU(): CPUDetection {
    return {
      cores: 4,
      logicalCores: 8,
      model: 'Unknown CPU',
      architecture: 'x64',
      vendor: 'Unknown',
      isDDR5: false,
      recommendedThreads: 4,
    };
  }

  /**
   * Get default memory info
   */
  private getDefaultMemory(): MemoryDetection {
    return {
      total: 8,
      available: 4,
      type: 'DDR4',
      speed: 2400,
      recommendedBatchSize: 256,
      recommendedContextSize: 1024,
    };
  }
}
