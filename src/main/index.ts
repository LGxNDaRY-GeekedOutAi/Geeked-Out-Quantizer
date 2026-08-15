/**
 * Geeked.Out Quantizer - Main Process Entry Point
 * 
 * Electron main process that handles:
 * - Window management
 * - Quantization pipeline orchestration
 * - Hardware detection
 * - IPC communication with renderer
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { QuantizationEngine } from './quantization/engine';
import { HardwareDetector } from './hardware/detector';
import { ConfigManager } from '../shared/config';
import { Logger } from '../shared/logger';

// Enable strict mode
app.enableSandbox();

// Handle CUDA initialization early
process.env.CUDA_VISIBLE_DEVICES = process.env.CUDA_VISIBLE_DEVICES || '0';

let mainWindow: BrowserWindow | null = null;
const quantizationEngine = new QuantizationEngine();
const hardwareDetector = new HardwareDetector();
const configManager = new ConfigManager();

/**
 * Create the main application window
 */
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Geeked.Out Quantizer',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    backgroundColor: '#1a1a2e',
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the application
 */
async function initialize(): Promise<void> {
  Logger.info('Geeked.Out Quantizer starting...');

  // Detect hardware
  const hardwareInfo = await hardwareDetector.detectAll();
  Logger.info(`Hardware detected: ${JSON.stringify(hardwareInfo)}`);

  // Load configuration
  configManager.load();

  // Create main window
  createMainWindow();
}

/**
 * IPC Handler Setup
 */
function setupIpcHandlers(): void {
  // Hardware detection
  ipcMain.handle('hardware:detect-cpu', async () => {
    return hardwareDetector.detectCPU();
  });

  ipcMain.handle('hardware:detect-gpu', async () => {
    return hardwareDetector.detectGPU();
  });

  ipcMain.handle('hardware:detect-memory', async () => {
    return hardwareDetector.detectMemory();
  });

  // Quantization
  ipcMain.handle('quantization:start', async (_event, params: any) => {
    try {
      const result = await quantizationEngine.quantize(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('quantization:cancel', async () => {
    quantizationEngine.cancel();
    return { success: true };
  });

  ipcMain.handle('quantization:status', async () => {
    return quantizationEngine.getStatus();
  });

  // imatrix
  ipcMain.handle('imatrix:generate', async (_event, params: any) => {
    try {
      const result = await quantizationEngine.generateImatrix(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // File operations
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'GGUF Files', extensions: ['gguf'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    return result;
  });

  ipcMain.handle('file:save', async (_event, defaultPath: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath,
      filters: [
        { name: 'YAML Files', extensions: ['yaml', 'yml'] },
        { name: 'JSON Files', extensions: ['json'] },
      ],
    });
    return result;
  });

  // Configuration
  ipcMain.handle('config:load', async () => {
    return configManager.load();
  });

  ipcMain.handle('config:save', async (_event, config: any) => {
    return configManager.save(config);
  });

  // Presets
  ipcMain.handle('presets:list', async () => {
    return configManager.getPresets();
  });

  ipcMain.handle('presets:save', async (_event, name: string, preset: any) => {
    return configManager.savePreset(name, preset);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await initialize();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  quantizationEngine.cleanup();
});

export { mainWindow };
