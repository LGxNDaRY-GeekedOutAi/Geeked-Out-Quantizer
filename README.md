# 🧠 Geeked.Out Quantizer

**Intelligent GGUF Large Language Model Quantizer** — A powerful, open-source quantization pipeline with importance-aware IQ2_M support, automatic imatrix generation, memory management, and a polished Windows-native Electron desktop app.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)](#)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](#)
[![Electron](https://img.shields.io/badge/Electron-28%2B-47848F)](#)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Desktop App](#desktop-app)
  - [Command Line](#command-line)
  - [PowerShell Pipeline](#powershell-pipeline)
- [Quantization Methods](#quantization-methods)
- [Configuration](#configuration)
- [Hardware Detection](#hardware-detection)
- [Importance Matrix (imatrix)](#importance-matrix-imatrix)
- [Advanced Features](#advanced-features)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Geeked.Out Quantizer is a comprehensive tool for quantizing Large Language Models (LLMs) to GGUF format. It combines the power of [llama.cpp](https://github.com/ggerganov/llama.cpp) with intelligent automation, making it easy to convert models like Llama, Mistral, Phi, and others into efficient GGUF formats suitable for local inference.

The project provides both a **polished desktop application** and a **powerful command-line/PowerShell pipeline** for quantization workflows.

---

## Features

### 🎯 Core Features

- **Intelligent Quantization Pipeline** — Automatic model selection and parameter optimization
- **Importance-Aware IQ2_M Quantization** — Advanced quantization with imatrix for better quality
- **Automatic imatrix Generation** — Built-in importance matrix computation for optimal results
- **Memory Management** — Auto-tuning based on system RAM and GPU memory
- **Hardware Detection** — Automatic CPU core count, DDR5 detection, and CUDA GPU identification
- **Batch Processing** — Quantize multiple models in sequence
- **Progress Tracking** — Real-time progress updates with ETA

### 🖥️ Desktop App

- **Modern Electron UI** — Clean, responsive interface with dark/light theme support
- **Model Import** — Drag-and-drop or browse for model files
- **Parameter Controls** — Visual sliders and inputs for all quantization parameters
- **Hardware Info Panel** — Real-time system specifications display
- **Log Viewer** — Built-in terminal for quantization output
- **Save/Load Presets** — Save your favorite configurations

### ⚡ Performance

- **CUDA Acceleration** — GPU-accelerated quantization via llama.cpp CUDA build
- **Multi-threading** — Automatic CPU core utilization
- **Memory Optimization** — Smart memory management for large models
- **Incremental Processing** — Handles models larger than available RAM

### 🔧 Technical

- **GGUF Format Support** — Full compatibility with llama.cpp ecosystem
- **Multiple Quantization Methods** — Q4_K_M, Q5_K_M, Q6_K, IQ2_XS, IQ2_M, and more
- **Configurable Pipeline** — YAML/JSON configuration files
- **Cross-Platform** — Windows, Linux, macOS support

---

## Architecture

```
Geeked.Out Quantizer
├── Core Engine (llama.cpp)
│   ├── Quantization Library
│   ├── GGUF Format Handler
│   └── CUDA Backend
├── PowerShell Pipeline
│   ├── Model Analyzer
│   ├── Parameter Optimizer
│   ├── imatrix Generator
│   └── Progress Monitor
├── Electron Desktop App
│   ├── UI Components
│   ├── State Management
│   └── IPC Bridge
└── Configuration System
    ├── Hardware Detection
    ├── Preset Manager
    └── Logging
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Git**
- **Windows**: PowerShell 7+
- **Linux/macOS**: Bash/Zsh
- **CUDA GPU** (optional, for accelerated quantization)

### 1. Clone the Repository

```bash
git clone https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer.git
cd geeked-out-quantizer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Download llama.cpp Binary

```bash
# Windows
.\scripts\download-binaries.ps1

# Linux/macOS
chmod +x scripts/download-binaries.sh
./scripts/download-binaries.sh
```

### 4. Launch the Desktop App

```bash
npm start
```

### 5. Or Use the PowerShell Pipeline

```powershell
.\scripts\quantize.ps1 -ModelPath "path/to/model.gguf" -QuantType IQ2_M
```

---

## Installation

### Desktop App

#### Windows
```bash
npm install
npm run electron:build
# Installer will be in dist/
```

#### Linux
```bash
npm install
npm run electron:build
# AppImage will be in dist/
```

#### macOS
```bash
npm install
npm run electron:build
# DMG will be in dist/
```

### CLI Only

```bash
npm install
# Use PowerShell scripts directly
```

---

## Usage

### Desktop App

1. **Launch** the app with `npm start`
2. **Import Model** — Click "Import Model" or drag a GGUF file
3. **Select Quantization Type** — Choose from available methods
4. **Configure Parameters** — Adjust threads, batch size, etc.
5. **Generate imatrix** (optional) — For IQ2_M and other importance-aware methods
6. **Start Quantization** — Click "Quantize" and monitor progress

### Command Line

```bash
# Basic quantization
node src/cli/quantize.js --model model.gguf --quant-type Q4_K_M

# With custom threads
node src/cli/quantize.js --model model.gguf --quant-type Q5_K_M --threads 8

# With imatrix
node src/cli/quantize.js --model model.gguf --quant-type IQ2_M --imatrix calibration.txt

# Batch quantization
node src/cli/quantize.js --config batch-config.json
```

### PowerShell Pipeline

```powershell
# Basic usage
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType Q4_K_M

# With imatrix generation
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType IQ2_M -GenerateImatrix

# With custom parameters
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType Q6_K -Threads 16 -BatchSize 512

# Import and quantize
.\scripts\quantize.ps1 -ImportPath "path/to/models" -QuantType Q4_K_M -OutputDir "quantized/"
```

---

## Quantization Methods

| Method | Description | Bitrate | Quality |
|--------|-------------|---------|---------|
| **Q4_0** | Original quantization | ~4.5 bpw | Good |
| **Q4_K_M** | Mixed quantization | ~4.9 bpw | Very Good |
| **Q5_0** | 5-bit quantization | ~5.5 bpw | Excellent |
| **Q5_K_M** | Mixed 5-bit | ~5.5 bpw | Excellent |
| **Q6_K** | 6-bit quantization | ~6.5 bpw | Near Lossless |
| **Q8_0** | 8-bit quantization | ~8.0 bpw | Near Lossless |
| **IQ2_XS** | Extremely low bit | ~2.0 bpw | Good for extreme compression |
| **IQ2_M** | Importance-aware | ~2.5 bpw | Best quality at low bitrate |
| **IQ3_XS** | 3-bit mixed | ~3.3 bpw | Very Good |
| **IQ3_XXS** | 3-bit extreme | ~3.0 bpw | Good |
| **F16** | 16-bit float | 16.0 bpw | Lossless |
| **F32** | 32-bit float | 32.0 bpw | Lossless |

### Importance-Aware Quantization (IQ2_M)

IQ2_M uses an importance matrix (imatrix) to identify which weights are most important to preserve, allowing for much better quality at extremely low bitrates.

```powershell
# Step 1: Generate imatrix
.\scripts\quantize.ps1 -ModelPath "model.gguf" -GenerateImatrix -CalibrationData "corpus.txt"

# Step 2: Quantize with imatrix
.\scripts\quantize.ps1 -ModelPath "model.gguf" -QuantType IQ2_M -Imatrix "imatrix.gguf"
```

---

## Configuration

### Hardware Detection

The quantizer automatically detects your system hardware:

```powershell
# Check detected hardware
.\scripts\detect-hardware.ps1
```

Output example:
```
CPU Cores: 16 (8P + 8E)
RAM: 32 GB DDR5-5600
GPU: NVIDIA RTX 4070 (CUDA 12.2)
Recommended Threads: 16
Recommended Batch Size: 1024
```

### Preset Configuration

Create a `config.yaml` file:

```yaml
quantization:
  default_type: IQ2_M
  threads: auto
  batch_size: auto
  context_size: 4096

imatrix:
  enabled: true
  calibration_corpus: "corpus.txt"
  ntokens: 128000

hardware:
  auto_detect: true
  cuda: true
  memory_limit: 0.9

output:
  format: gguf
  suffix: "_quantized"
  compress: true
```

### Preset Presets

The app includes built-in presets:

- **Fast** — Quick quantization, lower quality
- **Balanced** — Good quality/speed tradeoff
- **Quality** — Maximum quality, slower
- **Extreme** — Maximum compression (IQ2_M)
- **Custom** — Full manual control

---

## Hardware Detection

### CPU Detection

```powershell
# Detect CPU cores and architecture
.\scripts\detect-cpu.ps1
```

### GPU Detection

```powershell
# Detect CUDA GPUs
.\scripts\detect-gpu.ps1
```

### Memory Detection

```powershell
# Detect RAM and recommend settings
.\scripts\detect-memory.ps1
```

---

## Importance Matrix (imatrix)

The importance matrix is crucial for importance-aware quantization methods like IQ2_M.

### Generating imatrix

```powershell
# Generate from a text corpus
.\scripts\generate-imatrix.ps1 -Model "model.gguf" -Corpus "corpus.txt" -Output "imatrix.gguf"

# Generate from multiple files
.\scripts\generate-imatrix.ps1 -Model "model.gguf" -Files "corpus/*.txt" -Output "imatrix.gguf"
```

### Using imatrix

```powershell
# Quantize with imatrix
.\scripts\quantize.ps1 -Model "model.gguf" -QuantType IQ2_M -Imatrix "imatrix.gguf"
```

---

## Advanced Features

### Batch Processing

Create `batch-config.json`:

```json
{
  "models": [
    {
      "input": "llama-3-70b.gguf",
      "quant_type": "Q4_K_M",
      "output": "llama-3-70b-q4km.gguf"
    },
    {
      "input": "llama-3-70b.gguf",
      "quant_type": "Q5_K_M",
      "output": "llama-3-70b-q5km.gguf"
    },
    {
      "input": "llama-3-70b.gguf",
      "quant_type": "IQ2_M",
      "imatrix": "imatrix.gguf",
      "output": "llama-3-70b-iq2m.gguf"
    }
  ],
  "threads": 16,
  "parallel": false
}
```

Run batch:
```powershell
.\scripts\batch-quantize.ps1 -Config "batch-config.json"
```

### Memory Management

The quantizer automatically manages memory:

- **Auto-tuning** — Adjusts batch size based on available RAM
- **GPU Memory** — Detects and uses available VRAM
- **Swap Handling** — Gracefully handles out-of-memory conditions
- **Progressive Loading** — Loads models in chunks for large files

### CUDA Acceleration

```powershell
# Enable CUDA
.\scripts\quantize.ps1 -Model "model.gguf" -QuantType Q4_K_M -UseCuda

# Select specific GPU
.\scripts\quantize.ps1 -Model "model.gguf" -QuantType Q4_K_M -CudaDevice 0
```

---

## Project Structure

```
geeked-out-quantizer/
├── README.md                 # This file
├── LICENSE
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── electron-builder.yml      # Electron build config
├── .gitignore
│
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts          # Main entry point
│   │   ├── quantization/     # Quantization engine
│   │   │   ├── engine.ts     # Core quantization logic
│   │   │   ├── types.ts      # Type definitions
│   │   │   └── utils.ts      # Helper functions
│   │   ├── hardware/         # Hardware detection
│   │   │   ├── cpu.ts        # CPU detection
│   │   │   ├── gpu.ts        # GPU/CUDA detection
│   │   │   └── memory.ts     # RAM detection
│   │   └── ipc/              # IPC handlers
│   │       └── handlers.ts
│   │
│   ├── preload/              # Electron preload scripts
│   │   └── index.ts
│   │
│   ├── renderer/             # Electron renderer (UI)
│   │   ├── index.html        # Main HTML
│   │   ├── styles/           # CSS styles
│   │   │   ├── main.css
│   │   │   ├── components.css
│   │   │   └── themes.css
│   │   └── app.ts            # UI logic
│   │
│   ├── cli/                  # CLI tools
│   │   ├── quantize.ts       # Main CLI
│   │   └── imatrix.ts        # imatrix CLI
│   │
│   └── shared/               # Shared utilities
│       ├── config.ts         # Configuration
│       ├── logger.ts         # Logging
│       └── utils.ts          # Common utilities
│
├── scripts/                  # PowerShell/Bash scripts
│   ├── quantize.ps1          # Main quantization script
│   ├── detect-hardware.ps1   # Hardware detection
│   ├── generate-imatrix.ps1  # imatrix generation
│   ├── batch-quantize.ps1    # Batch processing
│   └── download-binaries.ps1 # Binary downloader
│
├── config/                   # Configuration files
│   ├── presets.yaml          # Built-in presets
│   └── default.yaml          # Default config
│
├── dist/                     # Build output
├── build/                    # Electron build output
└── node_modules/
```

---

## Development

### Setup

```bash
# Clone and install
git clone https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer.git
cd geeked-out-quantizer
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Available Scripts

```bash
npm start          # Start the desktop app
npm run dev        # Start in development mode
npm run build      # Build the app
npm run electron:build  # Build distributables
npm test           # Run tests
npm run lint       # Lint code
npm run typecheck  # TypeScript type check
```

### Building from Source

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build -- --win
npm run electron:build -- --linux
npm run electron:build -- --mac
```

---

## Contributing

Contributions are welcome! Please read our contributing guidelines:

### Getting Started

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Keep commits atomic and descriptive

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New quantization methods
- 🖥️ UI improvements
- 📚 Documentation
- 🧪 Tests
- 🐧 Linux/macOS support
- 🎨 Theme contributions

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — The foundation of GGUF quantization
- [Electron](https://www.electronjs.org/) — Desktop app framework
- [GGUF Format](https://github.com/ggerganov/ggml/blob/master/docs/gguf.md) — Model format specification

---

## Support

- 📖 [Documentation](README.md)
- 💬 [Discussions](https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer/discussions)
- 🐛 [Issue Tracker](https://github.com/LGxNDaRY-GeekedOutAi/geeked-out-quantizer/issues)

---

<div align="center">

**Made with ❤️ by [LGxNDaRY](https://github.com/LGxNDaRY-GeekedOutAi)**

⭐ Star this repo if you find it useful!

</div>
