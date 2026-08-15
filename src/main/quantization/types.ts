/**
 * Quantization Type Definitions
 */

export type QuantizationType =
  | 'Q4_0'
  | 'Q4_K_M'
  | 'Q5_0'
  | 'Q5_K_M'
  | 'Q6_K'
  | 'Q8_0'
  | 'IQ2_XS'
  | 'IQ2_M'
  | 'IQ3_XS'
  | 'IQ3_XXS'
  | 'F16'
  | 'F32';

export interface QuantizationParams {
  modelPath: string;
  quantType: QuantizationType;
  outputDir?: string;
  threads?: number;
  batchSize?: number;
  contextSize?: number;
  useCuda?: boolean;
  cudaDevice?: number;
  imatrix?: string;
  customArgs?: string[];
}

export interface QuantizationStatus {
  state: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
  progress: number;
  eta: number | null;
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
}

export interface HardwareInfo {
  cpu: CPUDetection;
  gpu: GPUDetection | null;
  memory: MemoryDetection;
}

export interface CPUDetection {
  cores: number;
  logicalCores: number;
  model: string;
  architecture: string;
  vendor: string;
  isDDR5: boolean;
  recommendedThreads: number;
}

export interface GPUDetection {
  name: string;
  vendor: string;
  vram: number; // in GB
  cudaVersion: string;
  computeCapability: string;
  recommended: boolean;
}

export interface MemoryDetection {
  total: number; // in GB
  available: number; // in GB
  type: string;
  speed: number; // in MHz
  recommendedBatchSize: number;
  recommendedContextSize: number;
}

export interface Preset {
  name: string;
  description: string;
  quantType: QuantizationType;
  threads: number | 'auto';
  batchSize: number | 'auto';
  contextSize: number;
  useCuda: boolean;
  imatrixEnabled: boolean;
}

export interface AppConfig {
  hardware: HardwareInfo;
  presets: Preset[];
  currentPreset: string;
  outputDir: string;
  lastModels: string[];
  theme: 'dark' | 'light';
  language: string;
}
