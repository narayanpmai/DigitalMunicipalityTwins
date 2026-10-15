# ==============================================================================
# Panchpokhari Thangpal Rural Municipality — Digital Twin Cluster Healthcheck
# Usage: powershell -ExecutionPolicy Bypass -File scripts/healthcheck.ps1
# ==============================================================================

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " [Panchpokhari Thangpal Digital Twin] Production Cluster Health Check" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

$Services = @(
    @{ Name = "Frontend SPA (Nginx)"; Url = "http://localhost:8080/"; Port = 8080 },
    @{ Name = "Backend API (NestJS)"; Url = "http://localhost:3001/api/v1/sensors"; Port = 3001 },
    @{ Name = "AI Microservice (FastAPI)"; Url = "http://localhost:8000/health"; Port = 8000 }
)

$AllHealthy = $true

foreach ($svc in $Services) {
    try {
        $response = Invoke-WebRequest -Uri $svc.Url -Method Get -TimeoutSec 4 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " [PASS] $($svc.Name) on port $($svc.Port) -> HTTP 200 OK" -ForegroundColor Green
        } else {
            Write-Host " [WARN] $($svc.Name) on port $($svc.Port) -> HTTP $($response.StatusCode)" -ForegroundColor Yellow
            $AllHealthy = $false
        }
    } catch {
        Write-Host " [FAIL] $($svc.Name) on port $($svc.Port) -> Unreachable / Connection Refused" -ForegroundColor Red
        $AllHealthy = $false
    }
}

# Check PostGIS Database
try {
    $dbTest = docker exec p5_postgres psql -U p5admin -d p5digital -c "SELECT PostGIS_Version();" 2>&1
    if ($dbTest -match "POSTGIS") {
        Write-Host " [PASS] PostGIS Database (p5_postgres) -> Active & Spatial Engine Online" -ForegroundColor Green
    } else {
        Write-Host " [WARN] PostGIS Database -> Connected, but PostGIS function test returned unexpected output." -ForegroundColor Yellow
    }
} catch {
    Write-Host " [FAIL] PostGIS Database (p5_postgres) -> Container not accessible via Docker." -ForegroundColor Red
    $AllHealthy = $false
}

Write-Host "----------------------------------------------------------------------"
if ($AllHealthy) {
    Write-Host " ALL SYSTEMS OPERATIONAL: Cluster is healthy and ready for production!" -ForegroundColor Green
} else {
    Write-Host " ATTENTION REQUIRED: One or more services are reporting warnings or errors." -ForegroundColor Yellow
}
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
