# Geeked.Out Quantizer - Hardware Detection Script
# Detects CPU, GPU, and memory information

[CmdletBinding()]
param(
    [switch]$CPU,
    [switch]$GPU,
    [switch]$Memory,
    [switch]$All
)

$ErrorActionPreference = 'Stop'

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host $Text -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
}

# CPU Detection
function Get-CPUInfo {
    Write-Header "CPU Information"
    
    $cpu = Get-CimInstance -ClassName Win32_Processor
    $cores = $cpu.NumberOfCores
    $logical = $cpu.NumberOfLogicalProcessors
    
    Write-Host "Model:        $($cpu.Name)" -ForegroundColor White
    Write-Host "Manufacturer: $($cpu.Manufacturer)" -ForegroundColor White
    Write-Host "Cores:        $cores" -ForegroundColor White
    Write-Host "Threads:      $logical" -ForegroundColor White
    Write-Host "Architecture: $($cpu.Architecture)" -ForegroundColor White
    
    # Check for DDR5
    $mem = Get-CimInstance -ClassName Win32_PhysicalMemory
    $isDDR5 = $mem | Where-Object { $_.MemoryType -eq 26 }
    Write-Host "DDR Type:     $(If ($isDDR5) { 'DDR5' } Else { 'DDR4 or earlier' })" -ForegroundColor White
    
    $recommendedThreads = [Math]::Min($cores, 32)
    Write-Host ""
    Write-Host "→ Recommended threads: $recommendedThreads" -ForegroundColor Green
}

# GPU Detection
function Get-GPUInfo {
    Write-Header "GPU Information"
    
    $gpus = Get-CimInstance -ClassName Win32_VideoController
    
    if (-not $gpus) {
        Write-Host "No GPU detected" -ForegroundColor Red
        return
    }
    
    foreach ($gpu in $gpus) {
        $vramGB = [Math]::Round($gpu.AdapterRAM / 1GB)
        Write-Host "Model:        $($gpu.Name)" -ForegroundColor White
        Write-Host "Vendor:       $($gpu.AdapterCompatibility)" -ForegroundColor White
        Write-Host "VRAM:         ${vramGB}GB" -ForegroundColor White
        Write-Host "Driver Version: $($gpu.DriverVersion)" -ForegroundColor White
        
        # Check CUDA
        try {
            $cudaPath = Get-ChildItem -Path "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($cudaPath) {
                Write-Host "CUDA:         $($cudaPath.Name) ✓" -ForegroundColor Green
            } else {
                Write-Host "CUDA:         Not installed" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "CUDA:         Not installed" -ForegroundColor Yellow
        }
        
        if ($vramGB -ge 8) {
            Write-Host "→ GPU is recommended for quantization" -ForegroundColor Green
        } else {
            Write-Host "→ GPU has limited VRAM for large models" -ForegroundColor Yellow
        }
    }
}

# Memory Detection
function Get-MemoryInfo {
    Write-Header "Memory Information"
    
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    $totalGB = [Math]::Round($os.TotalVisibleMemorySize / 1MB)
    $availableGB = [Math]::Round($os.FreePhysicalMemory / 1MB)
    
    $mem = Get-CimInstance -ClassName Win32_PhysicalMemory
    $memType = $mem[0].MemoryType
    $memSpeed = $mem[0].Speed
    
    $typeNames = @{
        24 = 'DDR3'
        26 = 'DDR4'
        30 = 'DDR5'
    }
    
    $typeName = $typeNames[$memType] ?? 'Unknown'
    
    Write-Host "Total:        ${totalGB}GB" -ForegroundColor White
    Write-Host "Available:    ${availableGB}GB" -ForegroundColor White
    Write-Host "Type:         $typeName" -ForegroundColor White
    Write-Host "Speed:        ${memSpeed}MHz" -ForegroundColor White
    
    # Recommendations
    $recommendedBatchSize = switch ($totalGB) {
        { $_ -ge 64 } { 2048 }
        { $_ -ge 32 } { 1024 }
        { $_ -ge 16 } { 512 }
        default { 256 }
    }
    
    $recommendedContextSize = switch ($totalGB) {
        { $_ -ge 64 } { 8192 }
        { $_ -ge 32 } { 4096 }
        { $_ -ge 16 } { 2048 }
        default { 1024 }
    }
    
    Write-Host ""
    Write-Host "→ Recommended batch size: $recommendedBatchSize" -ForegroundColor Green
    Write-Host "→ Recommended context size: $recommendedContextSize" -ForegroundColor Green
}

# Main
if ($CPU) { Get-CPUInfo }
elseif ($GPU) { Get-GPUInfo }
elseif ($Memory) { Get-MemoryInfo }
else {
    Get-CPUInfo
    Get-GPUInfo
    Get-MemoryInfo
}
