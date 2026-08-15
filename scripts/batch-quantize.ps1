# Geeked.Out Quantizer - Batch Quantization Script
# Quantizes multiple models in sequence

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, HelpMessage="Path to batch configuration JSON file")]
    [string]$ConfigPath
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$QuantizeScript = Join-Path $ScriptDir 'quantize.ps1'

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        📦 Geeked.Out Batch Quantizer                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Load configuration
if (-not (Test-Path $ConfigPath)) {
    Write-Host "Configuration file not found: $ConfigPath" -ForegroundColor Red
    exit 1
}

$config = Get-Content $ConfigPath | ConvertFrom-Json

$models = $config.models
$total = $models.Count
$completed = 0
$failed = 0

Write-Host "Found $total models to process" -ForegroundColor White
Write-Host ""

foreach ($model in $models) {
    $completed++
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host "[$completed/$total] Processing: $($model.input)" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
    
    $args = @(
        '-ModelPath', $model.input,
        '-QuantType', $model.quant_type
    )
    
    if ($model.output) {
        $args += '-OutputDir', (Split-Path $model.output -Parent)
    }
    
    if ($model.threads) {
        $args += '-Threads', $model.threads
    }
    
    if ($model.batch_size) {
        $args += '-BatchSize', $model.batch_size
    }
    
    if ($model.context_size) {
        $args += '-ContextSize', $model.context_size
    }
    
    if ($model.use_cuda) {
        $args += '-UseCuda'
    }
    
    if ($model.imatrix) {
        $args += '-Imatrix', $model.imatrix
    }
    
    try {
        & $QuantizeScript @args
        Write-Host "✓ Completed: $($model.input)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $($model.input) - $_" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Batch Complete" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Completed: $completed" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "  Failed: $failed" -ForegroundColor Red
}
Write-Host ""
