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
- **Configurable Pipeline** — In-app configuration with save/load presets
- **Cross-Platform** — Windows, Linux, macOS support (desktop app); Windows-only (CLI scripts)

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
- **Windows**: PowerShell 7+ (required for CLI scripts)
- **CUDA GPU** (optional, for accelerated quantization)

> **Note:** The CLI/PowerShell scripts are Windows-only. The desktop app supports Windows, Linux, and macOS.

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

```powershell
# Windows (PowerShell)
.\scripts\download-binaries.ps1
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

### CLI Only (Windows)

```bash
npm install
# Use PowerShell scripts directly
.\scripts\quantize.ps1 -ModelPath "path/to/model.gguf" -QuantType IQ2_M
```

---

## Usage

### Desktop App

1. **Launch** the app with `npm start`
2. **Import** a GGUF model via drag-and-drop or file browser
3. **Select** a quantization method from the dropdown
4. **Configure** parameters (threads, GPU layers, imatrix path)
5. **Start** quantization and monitor progress in the log viewer
6. **Save** your configuration as a preset for future use

### Command Line

```bash
# Start the desktop app
npm start

# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Build distributable
npm run electron:build

# Run tests
npm test

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Type check
npm run typecheck

# Clean build artifacts
npm run clean
```

### PowerShell Pipeline

```powershell
# Basic quantization
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType IQ2_M

# With custom output path
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType Q4_K_M -OutputPath "C:\models\llama-3-8b-Q4_K_M.gguf"

# With imatrix for importance-aware quantization
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType IQ2_M -ImatrixPath "C:\models\imatrix.dat"

# With custom thread count
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType Q6_K -Threads 8

# Batch quantization (multiple models)
.\scripts\batch-quantize.ps1 -ModelList "C:\models\list.txt" -QuantType Q4_K_M
```

---

## Quantization Methods

The following methods are available from the underlying [llama.cpp](https://github.com/ggerganov/llama.cpp) engine (`ggml_type` enum). They are grouped by bitrate category.

### Lossless / Near-Lossless

| Method | Bitrate | Quality |
|--------|---------|---------|
| F32 | 32.0 bpw | Full FP32 precision |
| F16 | 16.0 bpw | Full FP16 precision |
| BF16 | 16.0 bpw | Brain floating point (lossless) |
| Q8_0 | ~8.0 bpw | Near Lossless |
| Q6_K | ~6.5 bpw | Near Lossless |

### High Quality (5–6 bpw)

| Method | Bitrate | Quality |
|--------|---------|---------|
| Q5_K_M | ~5.5 bpw | Excellent |
| Q5_0 | ~5.5 bpw | Excellent |
| Q5_K | ~5.5 bpw | Excellent |
| Q5_1 | ~5.5 bpw | Excellent |

### Medium Quality (4–5 bpw)

| Method | Bitrate | Quality |
|--------|---------|---------|
| Q4_K_M | ~4.9 bpw | Very Good |
| Q4_K | ~4.9 bpw | Very Good |
| IQ4_XS | ~4.25 bpw | Very Good |
| IQ4_NL | ~4.5 bpw | Non-linear quantization |
| Q4_1 | ~4.5 bpw | Good |
| Q4_0 | ~4.5 bpw | Good |

### Low Bitrate (2–4 bpw)

| Method | Bitrate | Quality |
|--------|---------|---------|
| IQ3_XS | ~3.3 bpw | Very Good |
| IQ3_S | ~3.4 bpw | Very Good |
| Q3_K | ~3.3 bpw | Good |
| IQ2_M | ~2.5 bpw | Best quality at low bitrate |
| IQ2_S | ~2.3 bpw | Good |
| IQ2_XS | ~2.0 bpw | Good for extreme compression |
| Q2_K | ~2.5 bpw | Low bitrate |

### Extreme Compression (< 2 bpw)

| Method | Bitrate | Quality |
|--------|---------|---------|
| IQ1_S | ~1.3 bpw | Extreme compression |
| IQ1_M | ~1.6 bpw | Extreme compression |
| Q1_0 | ~1.5 bpw | Extreme compression |
| IQ3_XXS | ~3.0 bpw | Good |

### Emerging Formats

| Method | Bitrate | Quality |
|--------|---------|---------|
| MXFP4 | 4.0 bpw | Matrix FP4 (experimental) |
| NVFP4 | 4.0 bpw | NVIDIA FP4 (experimental) |

> **Note:** Not all methods are supported on every hardware platform. IQ2_M requires imatrix for best results.

---

## Configuration

Configuration is managed through the desktop app's built-in preset system. Save your favorite configurations and load them later.

### Default Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Threads | Auto-detected | Number of CPU threads |
| GPU Layers | 0 | Number of layers to offload to GPU |
| Block Size | Auto | Block size for quantization |
| Imatrix Path | None | Path to importance matrix file |

### Preset Management

- **Save Preset** — Save current settings with a custom name
- **Load Preset** — Load a previously saved configuration
- **Export Preset** — Export preset as JSON file
- **Import Preset** — Import preset from JSON file

---

## Hardware Detection

The tool automatically detects your system hardware and optimizes settings:

### Detected Information

- **CPU Cores** — Logical processor count for thread optimization
- **RAM** — Total system memory for buffer sizing
- **GPU** — CUDA-capable GPU detection and VRAM measurement
- **DDR5** — Memory type detection for bandwidth estimation

### Manual Override

You can override auto-detected values in the app settings or via CLI parameters:

```powershell
.\scripts\quantize.ps1 -ModelPath "C:\models\model.gguf" -QuantType Q4_K_M -Threads 4 -GPULayers 30
```

---

## Importance Matrix (imatrix)

The importance matrix (imatrix) captures token importance statistics from a text corpus, enabling better quality at lower bitrates.

### Generating imatrix

```powershell
# Generate imatrix from a text corpus
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType IQ2_M -GenerateImatrix -CorpusPath "C:\corpus\text.txt"
```

### Using imatrix

```powershell
# Apply imatrix during quantization
.\scripts\quantize.ps1 -ModelPath "C:\models\llama-3-8b.gguf" -QuantType IQ2_M -ImatrixPath "C:\models\imatrix.dat"
```

### Tips

- Use a corpus representative of your target use case
- Minimum 100MB of text recommended
- Domain-specific text yields better results

---

## Advanced Features

### Batch Processing

Quantize multiple models in sequence:

```powershell
# Create a text file with model paths (one per line)
# C:\models\model1.gguf
# C:\models\model2.gguf
# C:\models\model3.gguf

.\scripts\batch-quantize.ps1 -ModelList "C:\models\list.txt" -QuantType Q4_K_M
```

### CUDA Acceleration

For GPU-accelerated quantization, ensure you have:

1. NVIDIA CUDA GPU (compute capability 5.0+)
2. CUDA toolkit installed
3. llama.cpp CUDA binaries downloaded

```powershell
# The script will auto-detect CUDA and enable GPU acceleration
.\scripts\quantize.ps1 -ModelPath "C:\models\model.gguf" -QuantType Q4_K_M -GPULayers 33
```

### Memory Management

The tool automatically manages memory based on your system:

- **RAM < 16GB** — Conservative memory usage, lower block sizes
- **RAM 16-32GB** — Balanced memory usage
- **RAM > 32GB** — Aggressive memory usage, higher block sizes

---

## Project Structure

```
geeked-out-quantizer/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── quantize.ts    # Quantization engine
│   │   ├── hardware.ts    # Hardware detection
│   │   └── ipc.ts         # IPC handlers
│   ├── renderer/          # Electron UI
│   │   ├── index.html     # UI template
│   │   ├── app.ts         # UI logic
│   │   └── styles/        # CSS themes
│   ├── preload/           # Security bridge
│   │   └── index.ts
│   └── shared/            # Shared utilities
│       ├── config.ts      # Config manager
│       └── logger.ts      # Logging
├── scripts/               # PowerShell scripts
│   ├── quantize.ps1       # Main quantization script
│   ├── detect-hardware.ps1 # Hardware detection
│   ├── download-binaries.ps1 # Binary downloader
│   └── batch-quantize.ps1  # Batch processing
├── dist/                  # Build output
├── package.json           # Dependencies and scripts
├── tsconfig.main.json     # TypeScript config (main)
├── tsconfig.renderer.json # TypeScript config (renderer)
├── electron-builder.yml   # Electron build config
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── CONTRIBUTING.md        # Contribution guide
├── CHANGELOG.md           # Version history
└── LICENSE                # MIT License
```

---

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development mode (auto-reload)
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
npm run lint:fix   # Fix lint issues
npm run typecheck  # TypeScript type check
npm run clean      # Clean build artifacts
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
- 🐧 Linux/macOS CLI support
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
