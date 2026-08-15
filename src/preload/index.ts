/**
 * Electron Preload Script
 * 
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods
contextBridge.exposeInMainWorld('electronAPI', {
  // Hardware
  detectCPU: () => ipcRenderer.invoke('hardware:detect-cpu'),
  detectGPU: () => ipcRenderer.invoke('hardware:detect-gpu'),
  detectMemory: () => ipcRenderer.invoke('hardware:detect-memory'),

  // Quantization
  startQuantization: (params: any) => ipcRenderer.invoke('quantization:start', params),
  cancelQuantization: () => ipcRenderer.invoke('quantization:cancel'),
  getQuantizationStatus: () => ipcRenderer.invoke('quantization:status'),

  // imatrix
  generateImatrix: (params: any) => ipcRenderer.invoke('imatrix:generate', params),

  // File operations
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (defaultPath: string) => ipcRenderer.invoke('file:save', defaultPath),

  // Configuration
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (config: any) => ipcRenderer.invoke('config:save', config),

  // Presets
  listPresets: () => ipcRenderer.invoke('presets:list'),
  savePreset: (name: string, preset: any) => ipcRenderer.invoke('presets:save', name, preset),

  // Version
  getVersion: () => process.env.npm_package_version || '1.0.0',
});
