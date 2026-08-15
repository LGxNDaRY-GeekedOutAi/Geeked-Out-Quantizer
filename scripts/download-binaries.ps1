# Geeked.Out Quantizer - Binary Download Script
# Downloads llama.cpp quantize binaries

[Cmdlet::CmdletBinding()]
param(
    [switch]$CUDA,
    [switch]$CPU,
    [string]$Version = 'master'
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinDir = Join-Path $ScriptDir '..' 'bin'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        📦 llama.cpp Binary Downloader                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Create bin directory
if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
    Write-Host "Created bin directory: $BinDir" -ForegroundColor Green
}

# Detect architecture
$isWindows = $IsWindows
$isLinux = $IsLinux
$isMac = $IsMacOS

if ($isWindows) {
    Write-Host "Platform: Windows x64" -ForegroundColor White
} elseif ($isLinux) {
    Write-Host "Platform: Linux x64" -ForegroundColor White
} elseif ($isMac) {
    Write-Host "Platform: macOS" -ForegroundColor White
} else {
    Write-Host "Unknown platform" -ForegroundColor Red
    exit 1
}

# Download CUDA build
if ($CUDA -or (-not $CPU)) {
    Write-Host ""
    Write-Host "Downloading CUDA build..." -ForegroundColor Yellow
    
    if ($isWindows) {
        $url = "https://github.com/ggerganov/llama.cpp/releases/download/$Version/llama-quantize.exe"
        $output = Join-Path $BinDir 'llama-quantize-cuda.exe'
    } elseif ($isLinux) {
        $url = "https://github.com/ggerganov/llama.cpp/releases/download/$Version/llama-quantize"
        $output = Join-Path $BinDir 'llama-quantize-cuda'
    } else {
        Write-Host "CUDA builds not available for macOS" -ForegroundColor Yellow
        $url = $null
    }
    
    if ($url) {
        try {
            Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
            Write-Host "✓ CUDA binary downloaded: $output" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to download CUDA binary: $_" -ForegroundColor Red
        }
    }
}

# Download CPU build
if ($CPU -or (-not $CUDA)) {
    Write-Host ""
    Write-Host "Downloading CPU build..." -ForegroundColor Yellow
    
    if ($isWindows) {
        $url = "https://github.com/ggerganov/llama.cpp/releases/download/$Version/llama-quantize-cpu.exe"
        $output = Join-Path $BinDir 'llama-quantize.exe'
    } elseif ($isLinux) {
        $url = "https://github.com/ggerganov/llama.cpp/releases/download/$Version/llama-quantize-cpu"
        $output = Join-Path $BinDir 'llama-quantize'
    } else {
        $url = "https://github.com/ggerganov/llama.cpp/releases/download/$Version/llama-quantize-cpu"
        $output = Join-Path $BinDir 'llama-quantize'
    }
    
    if ($url) {
        try {
            Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
            Write-Host "✓ CPU binary downloaded: $output" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to download CPU binary: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Done! Binaries are in: $BinDir" -ForegroundColor Green
Write-Host ""
