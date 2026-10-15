# ==============================================================================
# Panchpokhari Thangpal Rural Municipality — Automated PostGIS Backup Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts/backup_db.ps1
# ==============================================================================

$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (!(Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Cyan
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "p5digital_backup_$Timestamp.sql"
$BackupFilePath = Join-Path $BackupDir $BackupFileName

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [Municipal Digital Twins] PostGIS Database Backup Utility" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Target Database : p5digital"
Write-Host "Container Name  : p5_postgres"
Write-Host "Backup Output   : $BackupFilePath"
Write-Host "Timestamp       : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "----------------------------------------------------------"

try {
    # Run pg_dump inside p5_postgres container
    docker exec p5_postgres pg_dump -U p5admin -d p5digital --clean --if-exists > $BackupFilePath

    if (Test-Path $BackupFilePath) {
        $FileSize = (Get-Item $BackupFilePath).Length
        $FileSizeKB = [Math]::Round($FileSize / 1024, 2)

        if ($FileSize -gt 500) {
            Write-Host "SUCCESS: Database backup completed successfully!" -ForegroundColor Green
            Write-Host "File Size: $FileSizeKB KB" -ForegroundColor Green
            Write-Host "Saved to : $BackupFilePath" -ForegroundColor Cyan
        } else {
            Write-Host "WARNING: Backup file was created but size is suspiciously small ($FileSize bytes). Check container logs." -ForegroundColor Yellow
        }
    } else {
        Write-Host "ERROR: Backup file could not be verified." -ForegroundColor Red
    }

    # Rotate old backups - keep latest 7
    $OldBackups = Get-ChildItem -Path $BackupDir -Filter "p5digital_backup_*.sql" | Sort-Object CreationTime -Descending | Select-Object -Skip 7
    foreach ($old in $OldBackups) {
        Remove-Item $old.FullName -Force
        Write-Host "Rotated old backup: $($old.Name)" -ForegroundColor DarkGray
    }

} catch {
    Write-Host "FAILED: Exception during database backup: $_" -ForegroundColor Red
}
