# Municipal Digital Twins - Background Services Auto-Starter and Watchdog
# Automatically starts and continuously monitors Municipal FastAPI Backend (Port 3002) & AI Microservice (Port 8001)

$ErrorActionPreference = "Continue"

$baseDir = "C:\inetpub\wwwroot\Municipal_Digital_Twins-main"
$logDir = Join-Path $baseDir "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$mainLog = Join-Path $logDir "service_manager.log"

function Write-ServiceLog {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $message"
    Write-Output $line
    Add-Content -Path $mainLog -Value $line -ErrorAction SilentlyContinue
}

Write-ServiceLog "Municipal Service Manager Watchdog starting..."

# 1. Ensure PostgreSQL service is running
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -ne 'Running' }
    if ($pgService) {
        Write-ServiceLog "Starting PostgreSQL service..."
        $pgService | Start-Service
        Start-Sleep -Seconds 3
    }
} catch {
    Write-ServiceLog "PostgreSQL service check warning: $_"
}

$pythonExe = Join-Path $baseDir "fastapi-backend\venv\Scripts\python.exe"
$backendDir = Join-Path $baseDir "fastapi-backend"
$aiDir = Join-Path $baseDir "ai-service"

function Test-PortListening {
    param([int]$port)
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

function Ensure-FastApiBackend {
    if (-not (Test-PortListening 3002)) {
        Write-ServiceLog "Port 3002 not listening. Launching Municipal FastAPI Backend..."
        $stdOut = Join-Path $logDir "fastapi_stdout.log"
        $stdErr = Join-Path $logDir "fastapi_stderr.log"
        
        Start-Process -FilePath $pythonExe `
            -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 3002" `
            -WorkingDirectory $backendDir `
            -RedirectStandardOutput $stdOut `
            -RedirectStandardError $stdErr `
            -WindowStyle Hidden
            
        Start-Sleep -Seconds 3
    }
}

function Ensure-AiService {
    if (-not (Test-PortListening 8001)) {
        Write-ServiceLog "Port 8001 not listening. Launching Municipal AI Service..."
        $stdOut = Join-Path $logDir "ai_stdout.log"
        $stdErr = Join-Path $logDir "ai_stderr.log"
        
        Start-Process -FilePath $pythonExe `
            -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8001" `
            -WorkingDirectory $aiDir `
            -RedirectStandardOutput $stdOut `
            -RedirectStandardError $stdErr `
            -WindowStyle Hidden
            
        Start-Sleep -Seconds 3
    }
}

# Initial Startup
Ensure-FastApiBackend
Ensure-AiService

Write-ServiceLog "Both Municipal services initialized. Entering watchdog monitor loop (15s interval)..."

# Watchdog Loop: Keeps services alive automatically
while ($true) {
    Start-Sleep -Seconds 15
    Ensure-FastApiBackend
    Ensure-AiService
}
