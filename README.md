# 🧠 Geeked.Out Quantizer — Professional Analytical Documentation

## 👤 Author Journey: One Year Dedicated to AI & Large Language Models

For the past year, I have revolved my life around understanding Artificial Intelligence and Large Language Models. This project is the direct result of that dedicated study — from fundamental LLM architecture to hands-on quantization engineering.

**My learning path encompassed:**
* **LLM Internals**: Tokenization, attention mechanisms, transformer variants, GGUF format specifications, model sharding
* **Quantization Theory**: Post-training quantization, K-quants, ternary quantization, importance-aware IQ series, imatrix generation theory and practice
* **Systems Programming**: Windows PowerShell automation, WMI/CIM hardware detection, memory management, CUDA integration
* **Desktop Development**: Electron IPC architecture, TypeScript state management, UI/UX for technical workflows
* **Productionization**: Build pipelines, electron-builder distribution, professional documentation

This README documents the extent of my knowledge while developing this application, with professional precision, detailed explanations, and practical guidance.

---

## 📖 What Is Geeked.Out Quantizer?

**Geeked.Out Quantizer** is a Windows-native, open-source quantization workspace for GGUF large language models. It is not just a wrapper around `llama-quantize.exe` — it is a complete environment that handles the entire workflow from scanning source models to producing quantized outputs.

### Core Philosophy
* **Windows-First**: Built natively for Windows with PowerShell and Electron
* **Intelligent Automation**: Auto-detects hardware, manages memory, optimizes settings
* **Importance-Aware Quantization**: Automatic imatrix generation for superior IQ-series results
* **Desktop Experience**: Polished Electron UI with live console output
* **Batch Processing**: Quantize entire model libraries with a single command

### 🎬 Live Demo

[![Watch Geeked.Out Quantizer in Action](https://img.youtube.com/vi/1AQGA-KfX5w/hqdefault.jpg)](https://www.youtube.com/watch?v=1AQGA-KfX5w&t=660s)

*See the Geeked.Out Quantizer being used in practice — from model scanning to importance-aware quantization with automatic imatrix generation.*

---

## 🚀 How to Run This Project

### Prerequisites
* Windows 10 or later
* NVIDIA GPU with CUDA 12.4+ compatible driver (driver version 550+)
* PowerShell 5.1+ or PowerShell Core (pwsh)
* Node.js 18+ and npm

### Installation
```powershell
# Clone repository
git clone https://github.com/LGxNDaRY-GeekedOutAi/Geeked-Out-Quantizer.git
cd Geeked-Out-Quantizer

# Validate environment
.\install.ps1

# Install desktop app dependencies
npm install
```

### Running with npm start

**Build and launch the desktop app:**
```powershell
npm run start
```

**Build and launch with dev tools:**
```powershell
npm run start:debug
```

**Development mode:**
```powershell
npm run dev
```

**Create distribution:**
```powershell
npm run dist
```

The `npm start` command executes:
```
npm run build && set GEEKED_OUT_LAUNCHER=npm && electron .
```
This compiles TypeScript to `dist/` and launches the Electron app with the PowerShell backend.

### Running via PowerShell CLI

**Quantize a single model:**
```powershell
.\run.ps1 -Mode quantize `
    -Model .\Models\YourModel-BF16.gguf `
    -OutType IQ2_M `
    -GenerateIMatrix `
    -CalibrationFile .\Models\Calibration\sample-calibration.txt `
    -IMatrixChunks 50
```

**Batch quantize all models:**
```powershell
.\run.ps1 -Mode batch-quantize `
    -OutType IQ2_M `
    -GenerateIMatrix `
    -CalibrationFile .\Models\Calibration\sample-calibration.txt
```

**Scan models:**
```powershell
.\run.ps1 -Mode scan
```

---

## 🏗️ Core Mechanics & Architecture

### Technology Stack

```
Desktop Runtime: Electron 37.3.1
Application Logic: TypeScript 5.9.3
Backend Orchestration: PowerShell 5.1+
Quantization Engine: llama.cpp CUDA build
System Integration: WMI/CIM, NVIDIA CUDA
```

### Project Structure

```
Geeked-Out-Quantizer/
├── app/                    # Electron desktop app
│   ├── index.html          # UI template
│   ├── renderer.ts         # Frontend logic ~950 lines
│   └── styles.css          # UI styling
├── main.ts                 # Electron main process 862 lines
├── preload.ts              # IPC bridge
├── run.ps1                 # CLI launcher 443 lines
├── quantize-all.ps1        # Core pipeline 925 lines
├── Generate-IMatrix.ps1    # Imatrix generator
├── GeekedFingerprint.psm1  # Model fingerprinting module
├── package.json            # Build config
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

### Core Mechanics

**1. Intelligent Model Selection**
* Scans directories for `.gguf` files
* Prefers higher-fidelity sources: BF16 > F16 > F32
* Skips already quantized files unless forced
* Preserves sharded model sets

**2. Automatic Importance Matrix Generation**
* Uses `llama-imatrix.exe` with calibration data
* GPU-accelerated: 5-10x speedup with NVIDIA GPU
* Configurable chunks: 50 for quick tests, 200-500 for production

**3. Memory-Aware Execution**
* Configurable RAM reservation: default 4 GB
* Page file commit headroom: default 8 GB
* Auto pause-and-retry on low memory
* Auto-tuning thread count based on CPU and memory speed

**4. Hardware Detection**
* CPU cores detection
* Physical memory speed detection for DDR5 optimization
* CUDA availability detection
* GPU layer optimization

**5. Electron IPC Architecture**
```
Renderer → IPC → Main Process → PowerShell → llama.cpp
```
Channels include: `quantizer:get-initial-state`, `quantizer:start-operation`, `quantizer:get-system-health`, `quantizer:get-recommendation`, `quantizer:get-gpu-status`

---

## 📊 33 Quantization Targets

The codebase defines 33 quantization targets across 4 method groups.

### Distribution Graph

```
K-Quants 15        █████████████████████████████████
Importance 12      █████████████████████████
Float/Copy 4       ████████
Ternary 2          ████
```

### Target Categories

**Ternary — 2 targets**
* TQ2_0 — 2.06 bpw
* TQ1_0 — 1.69 bpw

**K-Quants — 15 targets**
```
Q2_K, Q2_K_S, Q3_K_M, Q3_K_S, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M,
Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0
```

**Importance-Aware IQ Series — 12 targets**
```
IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS,
IQ3_S, IQ3_M, IQ4_NL, IQ4_XS
```
Requires imatrix generation

**Float/Copy — 4 targets**
* F16, BF16, F32, COPY

### Bit Precision Spectrum

```
High Quality ←────────────────────────────────────────→ Ultra Compact
Q8_0  Q6_K  Q5_K_M  Q4_K_M  Q3_K_M  Q2_K  TQ2_0  TQ1_0
```

### Memory Multiplier Reference

```
Q8_0  : 1.10
Q6_K  : 0.88
Q5_K_M: 0.75
Q4_K_M: 0.62  ← Primary Quality Baseline
IQ3_M : 0.48
IQ2_M : 0.35
```

---

## 🎯 Use Cases & Applications

### 1. Personal LLM Workstation
* Quantize models for local inference on Windows desktop
* Reduce model size from 100GB to 10GB while maintaining quality
* Enable running 70B models on consumer hardware

### 2. Model Library Management
* Batch quantize entire model collections
* Maintain multiple quantization formats per model
* Automate model discovery and conversion pipelines

### 3. Research & Experimentation
* Compare quantization methods: K-quants vs IQ series vs Ternary
* Evaluate quality vs size trade-offs
* Test importance matrix generation parameters

### 4. Deployment Optimization
* Create optimized models for specific hardware
* Generate models for edge devices with limited RAM
* Produce multiple variants for different use cases

### 5. Educational Tool
* Learn LLM quantization in practice
* Understand GGUF format and model internals
* Experiment with imatrix calibration

### 6. Production Pipeline
* Integrate into CI/CD for model quantization
* Automate quantization on new model releases
* Maintain quantized model repository

### 7. Hardware Evaluation
* Benchmark quantization speed on different GPUs
* Test memory usage patterns
* Optimize thread counts for specific systems

---

## ⚙️ Configuration Options

### Memory Tuning
* `-ReservedMemoryGB` — Physical RAM to keep free, default 4
* `-ReservedCommitGB` — Page file headroom, default 8
* `-MemoryTuning` — Auto/DDR5/Default
* `-MemoryRetryCount` — Retries on low memory, default 20
* `-MemoryRetrySeconds` — Wait between retries, default 30

### IMatrix Options
* `-GenerateIMatrix` — Auto-generate imatrix
* `-CalibrationFile` — Path to calibration text
* `-IMatrixChunks` — Text chunks, default 200
* `-IMatrixGpuLayers` — GPU layers, default 99

### Quantization Options
* `-OutType` — Target format, default Q4_K_M
* `-SourcePreference` — PreferHighPrecision/Any
* `-AllowRequantize` — Allow re-quantizing
* `-Force` — Overwrite outputs
* `-Pure` — Use pure conversion path
* `-Threads` — CPU threads

---

## 📚 Documentation

* `DEEP_DIVE_REPORT.md` — 26.9KB comprehensive analysis
* `GEEKED_OUT_QUANTIZER_DEEP_DIVE.md` — 39.5KB technical deep dive
* `IMPORTANCE_MATRIX_GUIDE.md` — Complete imatrix guide
* `IMATRIX_TECHNICAL_DEEP_DIVE.md` — Technical imatrix theory
* `Example-IMatrix-Workflows.ps1` — 10 runnable examples

---

## 🏆 Credits

**Core Engine**: llama.cpp by Georgi Gerganov and contributors
**Desktop Framework**: Electron by GitHub/NearForm
**Language**: TypeScript by Microsoft
**Automation**: PowerShell by Microsoft
**GPU**: NVIDIA CUDA

This project synthesizes best practices from the LLM quantization community, Hugging Face ecosystem, and Windows desktop tooling.

---

*Created after one year dedicated to Artificial Intelligence and Large Language Models. Professional documentation of knowledge gained while developing Geeked.Out Quantizer.*
