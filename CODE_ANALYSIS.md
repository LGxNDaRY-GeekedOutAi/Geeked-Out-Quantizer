# Geeked.Out Quantizer — Codebase Analysis & 33 Quantization Targets

## Project Source Location
`A:\Geeked.Out`

## Architecture Overview

The project is a Windows-native GGUF quantization workspace built with a hybrid stack:

* **Desktop UI**: Electron 37.3.1 + TypeScript 5.9.3
* **Backend Orchestration**: PowerShell 5.1+ 
* **Quantization Engine**: llama.cpp CUDA build with `llama-quantize.exe` and `llama-imatrix.exe`
* **System Integration**: WMI/CIM for hardware detection, NVIDIA CUDA for GPU acceleration

## Core Modules Found

### Electron Application
* `main.ts` — 28.5KB, 862 lines. Main process, IPC handlers, PowerShell spawning, system health monitoring, smart recommendation engine
* `preload.ts` — IPC bridge
* `app/renderer.ts` — 42.6KB frontend logic, state management, preset profiles
* `app/index.html` — UI template
* `app/styles.css` — Theming

### PowerShell Pipeline
* `run.ps1` — 18.9KB, 443 lines. Main CLI launcher with modes: menu, quantize, batch-quantize, scan, update
* `quantize-all.ps1` — 34.6KB, 925 lines. Core quantization pipeline with intelligent model selection, memory-aware execution, batch processing
* `Generate-IMatrix.ps1` — 9.7KB. Advanced importance matrix generator with GPU layers
* `Verify-IMatrix-Setup.ps1` — Diagnostic tool
* `Example-IMatrix-Workflows.ps1` — 15.2KB with 10 runnable workflows
* `GeekedFingerprint.psm1` — 8.5KB PowerShell module for model fingerprinting
* `install.ps1` — 14.4KB environment validation & setup

### Configuration
* `package.json` — Electron builder config, dependencies
* `tsconfig.json` — TypeScript config
* `DEEP_DIVE_REPORT.md` — 26.9KB
* `GEEKED_OUT_QUANTIZER_DEEP_DIVE.md` — 39.5KB

## 33 Quantization Targets

The codebase defines 33 quantization targets across 4 method groups, verified in `main.ts` lines 59-93, `run.ps1`, and `renderer.ts`.

### Distribution

```
Ternary: 2
K-Quants: 15
Importance-Aware IQ Series: 12
Float/Copy: 4
Total: 33
```

### Ternary — 2 targets
* TQ2_0 — 2.06 bpw ternary
* TQ1_0 — 1.69 bpw ternary, smallest ternary output

### K-Quants — 15 targets
* Q2_K — Extremely compact 2-bit K-quant
* Q2_K_S — Smaller 2-bit K-quant variant
* Q3_K_M — Balanced 3-bit K-quant
* Q3_K_S — Smaller 3-bit K-quant
* Q3_K_L — Larger 3-bit K-quant
* Q4_0 — Classic 4-bit quantization
* Q4_1 — Classic 4-bit improved variant
* Q4_K_S — Smaller 4-bit K-quant
* Q4_K_M — Balanced 4-bit K-quant, recommended
* Q5_0 — Classic 5-bit quantization
* Q5_1 — Classic 5-bit improved variant
* Q5_K_S — Leaner 5-bit K-quant
* Q5_K_M — Higher quality 5-bit K-quant
* Q6_K — High quality 6-bit K-quant
* Q8_0 — Very high quality 8-bit quantization

### Importance-Aware IQ Series — 12 targets
Requires imatrix generation
* IQ1_S — ~1.0 bit importance-aware 1-bit style
* IQ1_M — ~1.0 bit importance-aware 1-bit medium
* IQ2_XXS — ~2.0 bit ultra-small
* IQ2_XS — ~2.0 bit extra-small
* IQ2_S — ~2.0 bit small
* IQ2_M — ~2.0 bit medium, recommended
* IQ3_XXS — ~3.0 bit ultra-small
* IQ3_XS — ~3.0 bit extra-small
* IQ3_S — ~3.0 bit small
* IQ3_M — ~3.0 bit medium
* IQ4_NL — ~4.0 bit non-linear
* IQ4_XS — ~4.0 bit extra-small

### Float/Copy — 4 targets
* F16 — 16-bit float output
* BF16 — bfloat16 output
* F32 — 32-bit float output
* COPY — Copy tensors without quantizing

## Graphs for Illustration

### Quantization Targets by Group
```
K-Quants 15 |███████████████
Importance 12 |████████████
Float/Copy 4 |████
Ternary 2 |██
```

### Bit Precision Spectrum
```
Q8_0  Q6_K  Q5_K_M  Q5_0  Q4_K_M  Q4_0  Q3_K_M  Q2_K  TQ2_0  TQ1_0
High Quality ←———————————————→ Ultra Compact

IQ1_S  IQ1_M  IQ2_M  IQ3_M  IQ4_XS
Importance-Aware progression
```

### Memory Multiplier Reference
From main.ts smart recommendation:
```
Q8_0  : 1.10
Q6_K  : 0.88
Q5_K_M: 0.75
Q4_K_M: 0.62  ← Primary Quality Baseline
IQ3_M : 0.48
IQ2_M : 0.35
```

## Key Features Implemented

* Intelligent model selection with source preference
* Automatic importance matrix generation
* Memory-aware execution with reserved RAM/commit headroom
* Hardware detection: CPU cores, DDR5, CUDA availability
* Batch quantization with include/exclude patterns
* Electron desktop UI with live console output and preset profiles
* 33 quantization targets with unified definition across TypeScript and PowerShell

## Credits

Core engine: llama.cpp by Georgi Gerganov and contributors
Desktop framework: Electron by GitHub/NearForm
Language runtime: TypeScript by Microsoft
Automation: PowerShell by Microsoft
GPU acceleration: NVIDIA CUDA

This analysis is based on direct inspection of A:\Geeked.Out source code.
