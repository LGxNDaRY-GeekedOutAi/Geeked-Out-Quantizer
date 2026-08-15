/**
 * Renderer Application Logic
 * 
 * Handles UI interactions and communicates with the main process
 */

class App {
  private theme: string = 'dark';
  private hardwareInfo: any = null;
  private isQuantizing: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.setupEventListeners();
    await this.detectHardware();
    this.loadTheme();
    this.log('Application initialized', 'info');
  }

  private setupEventListeners(): void {
    // Browse button
    document.getElementById('btn-browse')?.addEventListener('click', () => this.browseForModel());

    // Quantize button
    document.getElementById('btn-quantize')?.addEventListener('click', () => this.startQuantization());

    // Cancel button
    document.getElementById('btn-cancel')?.addEventListener('click', () => this.cancelQuantization());

    // Theme toggle
    document.getElementById('btn-theme')?.addEventListener('click', () => this.toggleTheme());

    // Settings
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());

    // Preset change
    document.getElementById('preset-select')?.addEventListener('change', (e) => this.onPresetChange(e));

    // Drag and drop
    const dropZone = document.querySelector('.file-input-wrapper') as HTMLElement;
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          this.setModelPath(files[0].path);
        }
      });
    }
  }

  private async detectHardware(): Promise<void> {
    try {
      const [cpu, gpu, memory] = await Promise.all([
        window.electronAPI.detectCPU(),
        window.electronAPI.detectGPU(),
        window.electronAPI.detectMemory(),
      ]);

      this.hardwareInfo = { cpu, gpu, memory };

      // Update UI
      document.getElementById('cpu-info')!.textContent =
        `${cpu.model} (${cpu.cores} cores)`;
      document.getElementById('gpu-info')!.textContent =
        gpu ? `${gpu.name} (${gpu.vram}GB)` : 'No GPU detected';
      document.getElementById('memory-info')!.textContent =
        `${memory.total}GB ${memory.type}`;

      // Auto-fill recommended values
      const threadsInput = document.getElementById('threads') as HTMLInputElement;
      const batchSizeInput = document.getElementById('batch-size') as HTMLInputElement;
      
      if (threadsInput && cpu.recommendedThreads) {
        threadsInput.value = String(cpu.recommendedThreads);
      }
      if (batchSizeInput && memory.recommendedBatchSize) {
        batchSizeInput.value = String(memory.recommendedBatchSize);
      }
    } catch (error) {
      this.log('Hardware detection failed', 'error');
    }
  }

  private async browseForModel(): Promise<void> {
    const result = await window.electronAPI.openFile();
    if (result.filePaths && result.filePaths.length > 0) {
      this.setModelPath(result.filePaths[0]);
    }
  }

  private setModelPath(path: string): void {
    const input = document.getElementById('model-path') as HTMLInputElement;
    if (input) {
      input.value = path;
      this.log(`Model loaded: ${path}`, 'info');
    }
  }

  private async startQuantization(): Promise<void> {
    const modelPath = (document.getElementById('model-path') as HTMLInputElement).value;
    if (!modelPath) {
      this.log('Please select a model file first', 'warning');
      return;
    }

    const quantType = (document.getElementById('quant-type') as HTMLSelectElement).value;
    const threads = parseInt((document.getElementById('threads') as HTMLInputElement).value) || 0;
    const batchSize = parseInt((document.getElementById('batch-size') as HTMLInputElement).value) || 512;
    const contextSize = parseInt((document.getElementById('context-size') as HTMLInputElement).value) || 4096;
    const useCuda = (document.getElementById('use-cuda') as HTMLInputElement).checked;
    const outputDir = (document.getElementById('output-dir') as HTMLInputElement).value || undefined;

    const params = {
      modelPath,
      quantType,
      threads,
      batchSize,
      contextSize,
      useCuda,
      outputDir,
    };

    // Show progress panel
    document.getElementById('progress-panel')!.style.display = 'block';
    document.getElementById('btn-quantize')!.style.display = 'none';
    document.getElementById('btn-cancel')!.style.display = 'inline-flex';
    this.isQuantizing = true;

    this.log(`Starting ${quantType} quantization...`, 'info');

    try {
      const result = await window.electronAPI.startQuantization(params);

      if (result.success) {
        this.log('Quantization completed successfully!', 'success');
        this.log(`Output: ${result.data.outputPath}`, 'success');
      } else {
        this.log(`Quantization failed: ${result.error}`, 'error');
      }
    } catch (error: any) {
      this.log(`Error: ${error.message}`, 'error');
    } finally {
      this.isQuantizing = false;
      document.getElementById('btn-quantize')!.style.display = 'inline-flex';
      document.getElementById('btn-cancel')!.style.display = 'none';
    }
  }

  private async cancelQuantization(): Promise<void> {
    await window.electronAPI.cancelQuantization();
    this.log('Quantization cancelled', 'warning');
  }

  private toggleTheme(): void {
    const themes = ['dark', 'light', 'high-contrast', 'colorblind'];
    const currentIndex = themes.indexOf(this.theme);
    this.theme = themes[(currentIndex + 1) % themes.length];
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.log(`Theme changed to ${this.theme}`, 'info');
  }

  private loadTheme(): void {
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.theme = saved;
      document.documentElement.setAttribute('data-theme', this.theme);
    }
  }

  private onPresetChange(e: Event): void {
    const preset = (e.target as HTMLSelectElement).value;
    const presets: Record<string, any> = {
      fast: { quantType: 'Q4_K_M', threads: 0, batchSize: 512, contextSize: 2048, useCuda: true },
      balanced: { quantType: 'Q5_K_M', threads: 0, batchSize: 1024, contextSize: 4096, useCuda: true },
      quality: { quantType: 'Q6_K', threads: 0, batchSize: 2048, contextSize: 8192, useCuda: true },
      extreme: { quantType: 'IQ2_M', threads: 0, batchSize: 512, contextSize: 4096, useCuda: true },
      custom: { quantType: 'Q4_K_M', threads: 0, batchSize: 512, contextSize: 4096, useCuda: false },
    };

    const p = presets[preset];
    if (p) {
      (document.getElementById('quant-type') as HTMLSelectElement).value = p.quantType;
      (document.getElementById('batch-size') as HTMLInputElement).value = String(p.batchSize);
      (document.getElementById('context-size') as HTMLInputElement).value = String(p.contextSize);
      (document.getElementById('use-cuda') as HTMLInputElement).checked = p.useCuda;
    }
  }

  private openSettings(): void {
    this.log('Settings panel (coming soon)', 'info');
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const container = document.getElementById('log-container');
    if (!container) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
