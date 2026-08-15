/**
 * Renderer Application Logic (Compiled)
 */

class App {
  constructor() {
    this.theme = 'dark';
    this.hardwareInfo = null;
    this.isQuantizing = false;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.detectHardware();
    this.loadTheme();
    this.log('Application initialized', 'info');
  }

  setupEventListeners() {
    document.getElementById('btn-browse')?.addEventListener('click', () => this.browseForModel());
    document.getElementById('btn-quantize')?.addEventListener('click', () => this.startQuantization());
    document.getElementById('btn-cancel')?.addEventListener('click', () => this.cancelQuantization());
    document.getElementById('btn-theme')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openSettings());
    document.getElementById('preset-select')?.addEventListener('change', (e) => this.onPresetChange(e));

    const dropZone = document.querySelector('.file-input-wrapper');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) this.setModelPath(files[0].path);
      });
    }
  }

  async detectHardware() {
    try {
      const [cpu, gpu, memory] = await Promise.all([
        window.electronAPI.detectCPU(),
        window.electronAPI.detectGPU(),
        window.electronAPI.detectMemory(),
      ]);
      this.hardwareInfo = { cpu, gpu, memory };
      document.getElementById('cpu-info')!.textContent = `${cpu.model} (${cpu.cores} cores)`;
      document.getElementById('gpu-info')!.textContent = gpu ? `${gpu.name} (${gpu.vram}GB)` : 'No GPU detected';
      document.getElementById('memory-info')!.textContent = `${memory.total}GB ${memory.type}`;
      const threadsInput = document.getElementById('threads');
      const batchSizeInput = document.getElementById('batch-size');
      if (threadsInput && cpu.recommendedThreads) threadsInput.value = String(cpu.recommendedThreads);
      if (batchSizeInput && memory.recommendedBatchSize) batchSizeInput.value = String(memory.recommendedBatchSize);
    } catch (error) {
      this.log('Hardware detection failed', 'error');
    }
  }

  async browseForModel() {
    const result = await window.electronAPI.openFile();
    if (result.filePaths && result.filePaths.length > 0) this.setModelPath(result.filePaths[0]);
  }

  setModelPath(path) {
    const input = document.getElementById('model-path');
    if (input) { input.value = path; this.log(`Model loaded: ${path}`, 'info'); }
  }

  async startQuantization() {
    const modelPath = document.getElementById('model-path').value;
    if (!modelPath) { this.log('Please select a model file first', 'warning'); return; }

    const params = {
      modelPath,
      quantType: document.getElementById('quant-type').value,
      threads: parseInt(document.getElementById('threads').value) || 0,
      batchSize: parseInt(document.getElementById('batch-size').value) || 512,
      contextSize: parseInt(document.getElementById('context-size').value) || 4096,
      useCuda: document.getElementById('use-cuda').checked,
      outputDir: document.getElementById('output-dir').value || undefined,
    };

    document.getElementById('progress-panel').style.display = 'block';
    document.getElementById('btn-quantize').style.display = 'none';
    document.getElementById('btn-cancel').style.display = 'inline-flex';
    this.isQuantizing = true;
    this.log(`Starting ${params.quantType} quantization...`, 'info');

    try {
      const result = await window.electronAPI.startQuantization(params);
      if (result.success) {
        this.log('Quantization completed successfully!', 'success');
        this.log(`Output: ${result.data.outputPath}`, 'success');
      } else {
        this.log(`Quantization failed: ${result.error}`, 'error');
      }
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
    } finally {
      this.isQuantizing = false;
      document.getElementById('btn-quantize').style.display = 'inline-flex';
      document.getElementById('btn-cancel').style.display = 'none';
    }
  }

  async cancelQuantization() {
    await window.electronAPI.cancelQuantization();
    this.log('Quantization cancelled', 'warning');
  }

  toggleTheme() {
    const themes = ['dark', 'light', 'high-contrast', 'colorblind'];
    const currentIndex = themes.indexOf(this.theme);
    this.theme = themes[(currentIndex + 1) % themes.length];
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.log(`Theme changed to ${this.theme}`, 'info');
  }

  loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) { document.documentElement.setAttribute('data-theme', saved); this.theme = saved; }
  }

  onPresetChange(e) {
    const preset = e.target.value;
    const presets = {
      fast: { quantType: 'Q4_K_M', batchSize: 512, contextSize: 2048, useCuda: true },
      balanced: { quantType: 'Q5_K_M', batchSize: 1024, contextSize: 4096, useCuda: true },
      quality: { quantType: 'Q6_K', batchSize: 2048, contextSize: 8192, useCuda: true },
      extreme: { quantType: 'IQ2_M', batchSize: 512, contextSize: 4096, useCuda: true },
      custom: { quantType: 'Q4_K_M', batchSize: 512, contextSize: 4096, useCuda: false },
    };
    const p = presets[preset];
    if (p) {
      document.getElementById('quant-type').value = p.quantType;
      document.getElementById('batch-size').value = String(p.batchSize);
      document.getElementById('context-size').value = String(p.contextSize);
      document.getElementById('use-cuda').checked = p.useCuda;
    }
  }

  openSettings() { this.log('Settings panel (coming soon)', 'info'); }

  log(message, type = 'info') {
    const container = document.getElementById('log-container');
    if (!container) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => { new App(); });
