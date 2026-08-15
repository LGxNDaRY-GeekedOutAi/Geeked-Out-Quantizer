# Geeked.Out Quantizer - Quick Start Guide

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer.git
cd geeked-out-quantizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Download llama.cpp Binaries

```powershell
# Windows
.\scripts\download-binaries.ps1

# Linux/macOS
chmod +x scripts/download-binaries.sh
./scripts/download-binaries.sh
```

### 4. Launch the App

```bash
npm start
```

## Quick Usage

### Desktop App

1. Open the app
2. Click "Browse" to select a GGUF model
3. Choose a preset (Fast, Balanced, Quality, or Extreme)
4. Click "Start Quantization"
5. Wait for completion

### PowerShell

```powershell
# Basic quantization
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType Q4_K_M

# With CUDA
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType Q5_K_M -UseCuda

# With imatrix
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType IQ2_M -GenerateImatrix -CorpusPath "corpus.txt"
```

### Check Hardware

```powershell
.\scripts\detect-hardware.ps1
```

## Presets

| Preset | Quant Type | Use Case |
|--------|-----------|----------|
| Fast | Q4_K_M | Quick conversion, acceptable quality loss |
| Balanced | Q5_K_M | Good quality/speed tradeoff (recommended) |
| Quality | Q6_K | Maximum quality, larger file size |
| Extreme | IQ2_M | Maximum compression, needs imatrix |

## Troubleshooting

### "llama.cpp binary not found"
Run `.\scripts\download-binaries.ps1`

### CUDA errors
Ensure NVIDIA CUDA Toolkit is installed and drivers are up to date

### Out of memory
Reduce batch size or context size in settings

## Resources

- [Full Documentation](README.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Issue Tracker](https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer/issues)
