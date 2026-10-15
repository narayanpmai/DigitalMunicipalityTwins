# PowerShell script to build and start the Municipal Digital Twins platform via Docker Compose

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Panchpokhari Digital Twin Platform - Docker Start" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check Docker status
Write-Host "`n[1/4] Checking Docker daemon status..." -ForegroundColor Yellow
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n==================================================================" -ForegroundColor Red
    Write-Host "  ERROR: Docker Desktop is unable to start!" -ForegroundColor Red
    Write-Host "==================================================================" -ForegroundColor Red
    Write-Host "`nDocker cannot start until WSL (Windows Subsystem for Linux) is updated." -ForegroundColor Yellow
    Write-Host "Fix it in 10 seconds:" -ForegroundColor Green
    Write-Host "  1. Double-click '1_UPDATE_WSL_FIRST.bat' in this project folder." -ForegroundColor White
    Write-Host "  2. Click [Yes] on the Windows permission prompt." -ForegroundColor White
    Write-Host "  3. Wait 20 seconds for Docker Desktop to turn green, then re-run this script.`n" -ForegroundColor White
    Write-Host "==================================================================`n" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Docker daemon is ready!" -ForegroundColor Green

# 2. Build and launch containers
Write-Host "`n[2/4] Building and launching containers via Docker Compose..." -ForegroundColor Yellow
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: docker compose up failed. Check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 3. Wait for containers to initialize
Write-Host "`n[3/4] Waiting for services to become healthy..." -ForegroundColor Yellow
$timeout = 60
$elapsed = 0
$ready = $false

while ($elapsed -lt $timeout) {
    $dbHealth = docker inspect --format='{{json .State.Health.Status}}' p5_postgres 2>$null
    if ($dbHealth -match "healthy") {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "." -NoNewline
}

Write-Host ""
if ($ready) {
    Write-Host "Database is healthy and ready!" -ForegroundColor Green
} else {
    Write-Host "Note: Database initialization is still progressing in background." -ForegroundColor Yellow
}

# 4. Show running status
Write-Host "`n[4/4] Container status:" -ForegroundColor Yellow
docker compose ps

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "  Platform Services Available At:" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  - Public Portal & Admin:  http://localhost:8080" -ForegroundColor White
Write-Host "  - Backend API:            http://localhost:3001" -ForegroundColor White
Write-Host "  - Swagger API Docs:       http://localhost:3001/api/docs" -ForegroundColor White
Write-Host "  - AI Microservice:        http://localhost:8000" -ForegroundColor White
Write-Host "  - PostgreSQL / PostGIS:   localhost:5433" -ForegroundColor White
Write-Host "====================================================`n" -ForegroundColor Green
Read-Host "Press Enter to exit"

