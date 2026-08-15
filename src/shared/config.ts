/**
 * Shared Configuration Manager
 * 
 * Handles loading, saving, and managing application configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { Preset, AppConfig } from '../main/quantization/types';
import { Logger } from './logger';

export class ConfigManager {
  private configPath: string;
  private presetsPath: string;

  constructor() {
    const appData = process.env.APPDATA || path.join(process.cwd(), '.config');
    this.configPath = path.join(appData, 'geeked-out-quantizer', 'config.json');
    this.presetsPath = path.join(appData, 'geeked-out-quantizer', 'presets.json');
  }

  /**
   * Load configuration
   */
  load(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data) as AppConfig;
      }
    } catch (error) {
      Logger.error('Failed to load config:', error);
    }

    return this.getDefaultConfig();
  }

  /**
   * Save configuration
   */
  save(config: AppConfig): boolean {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      Logger.info('Configuration saved');
      return true;
    } catch (error) {
      Logger.error('Failed to save config:', error);
      return false;
    }
  }

  /**
   * Get built-in presets
   */
  getPresets(): Preset[] {
    return [
      {
        name: 'Fast',
        description: 'Quick quantization, lower quality',
        quantType: 'Q4_K_M',
        threads: 'auto',
        batchSize: 512,
        contextSize: 2048,
        useCuda: true,
        imatrixEnabled: false,
      },
      {
        name: 'Balanced',
        description: 'Good quality/speed tradeoff',
        quantType: 'Q5_K_M',
        threads: 'auto',
        batchSize: 1024,
        contextSize: 4096,
        useCuda: true,
        imatrixEnabled: false,
      },
      {
        name: 'Quality',
        description: 'Maximum quality, slower',
        quantType: 'Q6_K',
        threads: 'auto',
        batchSize: 2048,
        contextSize: 8192,
        useCuda: true,
        imatrixEnabled: false,
      },
      {
        name: 'Extreme',
        description: 'Maximum compression (IQ2_M)',
        quantType: 'IQ2_M',
        threads: 'auto',
        batchSize: 512,
        contextSize: 4096,
        useCuda: true,
        imatrixEnabled: true,
      },
      {
        name: 'Custom',
        description: 'Full manual control',
        quantType: 'Q4_K_M',
        threads: 0,
        batchSize: 0,
        contextSize: 4096,
        useCuda: false,
        imatrixEnabled: false,
      },
    ];
  }

  /**
   * Save custom preset
   */
  savePreset(name: string, preset: Preset): boolean {
    try {
      let presets: Preset[] = [];
      if (fs.existsSync(this.presetsPath)) {
        const data = fs.readFileSync(this.presetsPath, 'utf-8');
        presets = JSON.parse(data);
      }

      // Check for duplicate name
      const existingIndex = presets.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
      if (existingIndex >= 0) {
        presets[existingIndex] = preset;
      } else {
        presets.push(preset);
      }

      const dir = path.dirname(this.presetsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.presetsPath, JSON.stringify(presets, null, 2));
      Logger.info(`Preset "${name}" saved`);
      return true;
    } catch (error) {
      Logger.error('Failed to save preset:', error);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      hardware: {
        cpu: {
          cores: 4,
          logicalCores: 8,
          model: 'Unknown CPU',
          architecture: 'x64',
          vendor: 'Unknown',
          isDDR5: false,
          recommendedThreads: 4,
        },
        gpu: null,
        memory: {
          total: 8,
          available: 4,
          type: 'DDR4',
          speed: 2400,
          recommendedBatchSize: 256,
          recommendedContextSize: 1024,
        },
      },
      presets: this.getPresets(),
      currentPreset: 'Balanced',
      outputDir: '',
      lastModels: [],
      theme: 'dark',
      language: 'en',
    };
  }
}
