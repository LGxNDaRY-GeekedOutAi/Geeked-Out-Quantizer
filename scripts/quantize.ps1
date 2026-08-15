# Geeked.Out Quantizer - PowerShell Quantization Pipeline
# Intelligent quantization with automatic hardware detection and parameter optimization

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, HelpMessage="Path to the input GGUF model file")]
    [string]$ModelPath,

    [Parameter(Mandatory=$false, HelpMessage="Quantization type (Q4_K_M, Q5_K_M, Q6_K, IQ2_M, etc.)")]
    [ValidateSet('Q4_0', 'Q4_K_M', 'Q5_0', 'Q5_K_M', 'Q6_K', 'Q8_0', 'IQ2_XS', 'IQ2_M', 'IQ3_XS', 'IQ3_XXS', 'F16', 'F32')]
    [string]$QuantType = 'Q4_K_M',

    [Parameter(Mandatory=$false, HelpMessage="Output directory (defaults to current directory)")]
    [string]$OutputDir = '',

    [Parameter(Mandatory=$false, HelpMessage="Number of threads (0 = auto)")]
    [int]$Threads = 0,

    [Parameter(Mandatory=$false, HelpMessage="Batch size")]
    [int]$BatchSize = 512,

    [Parameter(Mandatory=$false, HelpMessage="Context size")]
    [int]$ContextSize = 4096,

    [Parameter(Mandatory=$false, HelpMessage="Use CUDA GPU acceleration")]
    [switch]$UseCuda,

    [Parameter(Mandatory=$false, HelpMessage="CUDA device index")]
    [int]$CudaDevice = 0,

    [Parameter(Mandatory=$false, HelpMessage="Path to importance matrix file")]
    [string]$Imatrix = '',

    [Parameter(Mandatory=$false, HelpMessage="Generate importance matrix from corpus")]
    [switch]$GenerateImatrix,

    [Parameter(Mandatory=$false, HelpMessage="Path to calibration corpus")]
    [string]$CorpusPath = '',

    [Parameter(Mandatory=$false, HelpMessage="Number of tokens for imatrix generation")]
    [int]$NTokens = 128000,

    [Parameter(Mandatory=$false, HelpMessage="Path to llama.cpp quantize binary")]
    [string]$LlamaCppPath = ''
)

$ErrorActionPreference = 'Stop'

# ============================================================
# Configuration
# ============================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir = Join-Path $ScriptDir '..' 'bin'
$LogDir = Join-Path $ScriptDir '..' 'logs'

# ============================================================
# Utility Functions
# ============================================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'INFO'
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }
    Add-Content -Path (Join-Path $LogDir "quantizer.log") -Value $logEntry -Encoding UTF8
}

function Write-ProgressCustom {
    param(
        [string]$Activity,
        [double]$PercentComplete,
        [string]$Status
    )
    Write-Progress -Activity $Activity -PercentComplete $PercentComplete -Status $Status
}

# ============================================================
# Hardware Detection
# ============================================================

function Get-CPUInfo {
    Write-Log "Detecting CPU..."
    $cpu = Get-CimInstance -ClassName Win32_Processor
    $cores = $cpu.NumberOfCores
    $logical = $cpu.NumberOfLogicalProcessors
    
    # Check for DDR5
    $mem = Get-CimInstance -ClassName Win32_PhysicalMemory
    $isDDR5 = $mem | Where-Object { $_.MemoryType -eq 26 }  # 26 = DDR5
    
    $recommendedThreads = [Math]::Min($cores, 32)
    
    return @{
        Cores = $cores
        LogicalCores = $logical
        Model = $cpu.Name
        Vendor = $cpu.Manufacturer
        IsDDR5 = $isDDR5 -ne $null
        RecommendedThreads = $recommendedThreads
    }
}

function Get-GPUInfo {
    Write-Log "Detecting GPU..."
    $gpus = Get-CimInstance -ClassName Win32_VideoController
    
    if (-not $gpus) {
        Write-Log "No GPU detected"
        return $null
    }
    
    foreach ($gpu in $gpus) {
        $vramGB = [Math]::Round($gpu.AdapterRAM / 1GB)
        $cudaVersion = 'N/A'
        
        # Check CUDA availability
        try {
            $cudaPath = Get-ChildItem -Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($cudaPath) {
                $cudaVersion = $cudaPath.Name
            }
        } catch {
            # CUDA not installed
        }
        
        return @{
            Name = $gpu.Name
            Vendor = $gpu.AdapterCompatibility
            VRAM = $vramGB
            CUDAVersion = $cudaVersion
            Recommended = $vramGB -ge 8
        }
    }
}

function Get-MemoryInfo {
    Write-Log "Detecting memory..."
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    $totalGB = [Math]::Round($os.TotalVisibleMemorySize / 1MB)
    $availableGB = [Math]::Round($os.FreePhysicalMemory / 1MB)
    
    $mem = Get-CimInstance -ClassName Win32_PhysicalMemory
    $memType = $mem[0].MemoryType
    $memSpeed = $mem[0].Speed
    
    $recommendedBatchSize = switch ($totalGB) {
        { $_ -ge 64 } { 2048 }
        { $_ -ge 32 } { 1024 }
        { $_ -ge 16 } { 512 }
        default { 256 }
    }
    
    return @{
        TotalGB = $totalGB
        AvailableGB = $availableGB
        Type = $memType
        Speed = $memSpeed
        RecommendedBatchSize = $recommendedBatchSize
    }
}

# ============================================================
# Binary Detection
# ============================================================

function Get-LlamaCppBinary {
    Write-Log "Locating llama.cpp binary..."
    
    # Check if custom path provided
    if ($LlamaCppPath) {
        if (Test-Path $LlamaCppPath) {
            Write-Log "Using custom llama.cpp binary: $LlamaCppPath"
            return $LlamaCppPath
        }
        Write-Log "Custom binary not found: $LlamaCppPath" -Level 'WARNING'
    }
    
    # Check bin directory
    if (Test-Path $BinDir) {
        $cudaBin = Join-Path $BinDir 'llama-quantize-cuda.exe'
        $cpuBin = Join-Path $BinDir 'llama-quantize.exe'
        
        if ($UseCuda -and (Test-Path $cudaBin)) {
            Write-Log "Found CUDA binary: $cudaBin"
            return $cudaBin
        }
        
        if (Test-Path $cpuBin) {
            Write-Log "Found CPU binary: $cpuBin"
            return $cpuBin
        }
    }
    
    # Check system PATH
    $binary = Get-Command 'llama-quantize' -ErrorAction SilentlyContinue
    if ($binary) {
        Write-Log "Found llama-quantize in PATH"
        return $binary.Source
    }
    
    Write-Log "llama.cpp binary not found! Please run .\scripts\download-binaries.ps1" -Level 'ERROR'
    throw "llama.cpp binary not found"
}

# ============================================================
# imatrix Generation
# ============================================================

function Invoke-ImatrixGeneration {
    param(
        [string]$ModelPath,
        [string]$CorpusPath,
        [string]$OutputPath,
        [int]$NTokens,
        [int]$Threads
    )
    
    Write-Log "Generating importance matrix (imatrix)..."
    Write-Log "  Model: $ModelPath"
    Write-Log "  Corpus: $CorpusPath"
    Write-Log "  Output: $OutputPath"
    Write-Log "  Tokens: $NTokens"
    Write-Log "  Threads: $Threads"
    
    $llamaCpp = Get-LlamaCppBinary
    
    $args = @(
        '-m', $ModelPath,
        '-f', $CorpusPath,
        '--imatrix', $OutputPath,
        '-ngl', '99',
        '--threads', $Threads.ToString(),
        '-n', $NTokens.ToString()
    )
    
    Write-Log "Executing: $llamaCpp $($args -join ' ')"
    
    $process = Start-Process -FilePath $llamaCpp -ArgumentList $args -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Log "imatrix generated successfully: $OutputPath" -Level 'SUCCESS'
        return $true
    } else {
        Write-Log "imatrix generation failed with exit code: $($process.ExitCode)" -Level 'ERROR'
        return $false
    }
}

# ============================================================
# Quantization
# ============================================================

function Invoke-Quantization {
    param(
        [string]$ModelPath,
        [string]$QuantType,
        [string]$OutputPath,
        [int]$Threads,
        [int]$BatchSize,
        [int]$ContextSize,
        [bool]$UseCuda,
        [int]$CudaDevice,
        [string]$Imatrix
    )
    
    Write-Log "Starting quantization..."
    Write-Log "  Model: $ModelPath"
    Write-Log "  Type: $QuantType"
    Write-Log "  Output: $OutputPath"
    Write-Log "  Threads: $Threads"
    Write-Log "  Batch Size: $BatchSize"
    Write-Log "  Context Size: $ContextSize"
    
    $llamaCpp = Get-LlamaCppBinary
    
    $args = @(
        '-m', $ModelPath,
        '-q', $QuantType,
        '-o', $OutputPath,
        '--threads', $Threads.ToString(),
        '--batch-size', $BatchSize.ToString(),
        '--ctx-size', $ContextSize.ToString()
    )
    
    if ($UseCuda) {
        $args += '--cuda'
        $args += '--cuda-device'
        $args += $CudaDevice.ToString()
    }
    
    if ($Imatrix) {
        $args += '--imatrix'
        $args += $Imatrix
    }
    
    Write-Log "Executing: $llamaCpp $($args -join ' ')"
    
    $process = Start-Process -FilePath $llamaCpp -ArgumentList $args -NoNewWindow -PassThru
    
    # Monitor progress
    $startTime = Get-Date
    while (-not $process.HasExited) {
        $elapsed = (Get-Date) - $startTime
        Write-ProgressCustom -Activity "Quantizing ($QuantType)" -PercentComplete 50 -Status "Running... ($($elapsed.ToString('hh\:mm\:ss')))"
        Start-Sleep -Seconds 1
    }
    
    if ($process.ExitCode -eq 0) {
        Write-Log "Quantization completed successfully!" -Level 'SUCCESS'
        return @{
            Success = $true
            OutputPath = $OutputPath
        }
    } else {
        Write-Log "Quantization failed with exit code: $($process.ExitCode)" -Level 'ERROR'
        return @{
            Success = $false
            Error = "Exit code $($process.ExitCode)"
        }
    }
}

# ============================================================
# Main Execution
# ============================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🧠 Geeked.Out Quantizer v1.0.0                  ║" -ForegroundColor Cyan
Write-Host "║       Intelligent GGUF Model Quantization Pipeline       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Validate model path
if (-not (Test-Path $ModelPath)) {
    Write-Log "Model file not found: $ModelPath" -Level 'ERROR'
    exit 1
}

# Detect hardware
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Hardware Detection" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray

$cpuInfo = Get-CPUInfo
$gpuInfo = Get-GPUInfo
$memInfo = Get-MemoryInfo

Write-Host ""
Write-Host "CPU:    $($cpuInfo.Model) ($($cpuInfo.Cores) cores, $($cpuInfo.LogicalCores) threads)" -ForegroundColor White
Write-Host "GPU:    $($gpuInfo.Name | If ($_) { $_ } Else { 'None detected' })" -ForegroundColor White
Write-Host "RAM:    $($memInfo.TotalGB)GB (Available: $($memInfo.AvailableGB)GB)" -ForegroundColor White
Write-Host "DDR:    $(If ($cpuInfo.IsDDR5) { 'DDR5' } Else { 'DDR4' })" -ForegroundColor White
Write-Host ""

# Auto-detect parameters
if ($Threads -eq 0) {
    $Threads = $cpuInfo.RecommendedThreads
    Write-Log "Auto-detected threads: $Threads"
}

if ($BatchSize -eq 0) {
    $BatchSize = $memInfo.RecommendedBatchSize
    Write-Log "Auto-detected batch size: $BatchSize"
}

# Generate imatrix if requested
if ($GenerateImatrix) {
    if (-not $CorpusPath) {
        Write-Log "Corpus path required for imatrix generation" -Level 'ERROR'
        exit 1
    }
    
    if (-not (Test-Path $CorpusPath)) {
        Write-Log "Corpus file not found: $CorpusPath" -Level 'ERROR'
        exit 1
    }
    
    $imatrixOutput = Join-Path (Split-Path $ModelPath -Parent) "imatrix.gguf"
    $imatrixResult = Invoke-ImatrixGeneration -ModelPath $ModelPath -CorpusPath $CorpusPath -OutputPath $imatrixOutput -NTokens $NTokens -Threads $Threads
    
    if (-not $imatrixResult) {
        Write-Log "imatrix generation failed" -Level 'ERROR'
        exit 1
    }
    
    $Imatrix = $imatrixOutput
}

# Determine output path
$modelName = [System.IO.Path]::GetFileNameWithoutExtension($ModelPath)
if (-not $OutputDir) {
    $OutputDir = Split-Path $ModelPath -Parent
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$outputPath = Join-Path $OutputDir "${modelName}_${QuantType}.gguf"

# Run quantization
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Quantization" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

$result = Invoke-Quantization -ModelPath $ModelPath -QuantType $QuantType -OutputPath $outputPath -Threads $Threads -BatchSize $BatchSize -ContextSize $ContextSize -UseCuda $UseCuda -CudaDevice $CudaDevice -Imatrix $Imatrix

Write-Host ""
if ($result.Success) {
    Write-Host "✅ Quantization completed successfully!" -ForegroundColor Green
    Write-Host "   Output: $outputPath" -ForegroundColor Gray
} else {
    Write-Host "❌ Quantization failed: $($result.Error)" -ForegroundColor Red
    exit 1
}
