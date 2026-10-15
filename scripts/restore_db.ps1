# ==============================================================================
# Panchpokhari Thangpal Rural Municipality — PostGIS Database Restore Utility
# Usage: powershell -ExecutionPolicy Bypass -File scripts/restore_db.ps1 -BackupFile <path_to_file.sql>
# ==============================================================================

param (
    [string]$BackupFile
)

Write-Host "==========================================================" -ForegroundColor Red
Write-Host " [Municipal Digital Twins] PostGIS Database Restore Utility" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

if (-not $BackupFile) {
    # Pick the most recent backup if not specified
    $BackupDir = Join-Path $PSScriptRoot "..\backups"
    $Latest = Get-ChildItem -Path $BackupDir -Filter "p5digital_backup_*.sql" | Sort-Object CreationTime -Descending | Select-Object -First 1
    if ($Latest) {
        $BackupFile = $Latest.FullName
        Write-Host "No backup file specified. Using most recent snapshot: $($Latest.Name)" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: No backup files found in $BackupDir." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: Specified backup file does not exist: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "Restoring from: $BackupFile" -ForegroundColor Cyan
Write-Host "WARNING: This will overwrite existing database records in 'p5digital'." -ForegroundColor Yellow

try {
    Get-Content $BackupFile -Raw | docker exec -i p5_postgres psql -U p5admin -d p5digital
    Write-Host "SUCCESS: Database restored successfully from backup!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Error during database restoration: $_" -ForegroundColor Red
}
