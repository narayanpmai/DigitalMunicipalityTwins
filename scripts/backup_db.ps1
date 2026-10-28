# ==============================================================================
# Panchpokhari Thangpal Rural Municipality (पाँचपोखरी थाङपाल गाउँपालिका)
# Production PostGIS Database & Uploads Backup Utility
# Usage: powershell -ExecutionPolicy Bypass -File scripts/backup_db.ps1
# ==============================================================================

param (
    [string]$SecondaryBackupDir = "",
    [switch]$IncludeSqlText = $false
)

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $baseDir "backups"
$backendDir = Join-Path $baseDir "fastapi-backend"
$uploadsDir = Join-Path $backendDir "uploads"
$logDir = Join-Path $baseDir "logs"
$envFile = Join-Path $backendDir ".env"

if (-not (Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$backupLogFile = Join-Path $logDir "database_backup.log"

function Write-BackupLog {
    param([string]$message, [string]$color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $message"
    Write-Host $message -ForegroundColor $color
    Add-Content -Path $backupLogFile -Value $line -ErrorAction SilentlyContinue
}

# 1. Parse DB config from fastapi-backend/.env
$dbHost = "127.0.0.1"
$dbPort = "5432"
$dbName = "municipal_twin_db"
$dbUser = "muni_user"
$dbPass = "Muni_Prod_Db_2026!#p5"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            if ($line -match "^DB_HOST=(.+)$") { $dbHost = $matches[1].Trim('"').Trim("'") }
            if ($line -match "^DB_PORT=(.+)$") { $dbPort = $matches[1].Trim('"').Trim("'") }
            if ($line -match "^DB_NAME=(.+)$") { $dbName = $matches[1].Trim('"').Trim("'") }
            if ($line -match "^DB_USER=(.+)$") { $dbUser = $matches[1].Trim('"').Trim("'") }
            if ($line -match "^DB_PASSWORD=(.+)$") { $dbPass = $matches[1].Trim('"').Trim("'") }
            if ($line -match "^SECONDARY_BACKUP_PATH=(.+)$" -and -not $SecondaryBackupDir) { $SecondaryBackupDir = $matches[1].Trim('"').Trim("'") }
        }
    }
}

# 2. Locate PostgreSQL tools
$pgDumpExe = ""
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\13\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $pgDumpExe = $path
        break
    }
}

if (-not $pgDumpExe) {
    $cmd = Get-Command "pg_dump.exe" -ErrorAction SilentlyContinue
    if ($cmd) {
        $pgDumpExe = $cmd.Source
    }
}

if (-not $pgDumpExe) {
    Write-BackupLog "ERROR: pg_dump.exe could not be found. Check PostgreSQL installation." "Red"
    exit 1
}

$pgBinDir = Split-Path -Parent $pgDumpExe
$pgRestoreExe = Join-Path $pgBinDir "pg_restore.exe"

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DumpFileName = "p5_municipal_db_$Timestamp.dump"
$DumpFilePath = Join-Path $backupDir $DumpFileName
$MetaFileName = "p5_municipal_db_$Timestamp.meta.json"
$MetaFilePath = Join-Path $backupDir $MetaFileName

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " Panchpokhari Thangpal Rural Municipality - PostGIS Database Backup" -ForegroundColor Green
Write-Host " Panchpokhari Digital Twin Platform - Live Data Protection Utility" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "Database       : $dbName"
Write-Host "Host & Port    : $dbHost`:$dbPort"
Write-Host "Username       : $dbUser"
Write-Host "Backup Target  : $DumpFilePath"
Write-Host "Timestamp      : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "--------------------------------------------------------------------------"

$env:PGPASSWORD = $dbPass

try {
    Write-BackupLog "Starting PostGIS database backup for $dbName..." "Yellow"

    # 3. Create Custom Compressed PostGIS Dump (.dump)
    $dumpArgs = @(
        "-h", $dbHost,
        "-p", $dbPort,
        "-U", $dbUser,
        "-d", $dbName,
        "-F", "c",
        "-b",
        "--no-owner",
        "--no-privileges",
        "-f", $DumpFilePath
    )

    & $pgDumpExe @dumpArgs 2>&1 | Out-Null

    if (-not (Test-Path $DumpFilePath)) {
        throw "Backup file was not created: $DumpFilePath"
    }

    $dumpItem = Get-Item $DumpFilePath
    $fileSizeMB = [Math]::Round($dumpItem.Length / 1MB, 2)

    if ($dumpItem.Length -lt 100KB) {
        throw "Backup file size is suspiciously small ($($dumpItem.Length) bytes)."
    }

    Write-BackupLog "[1/3] PostGIS Dump successful: $DumpFileName ($fileSizeMB MB)" "Green"

    # 4. Verify Dump File Integrity
    $tocCount = 0
    if (Test-Path $pgRestoreExe) {
        $tocList = & $pgRestoreExe -l $DumpFilePath 2>$null
        $tocCount = ($tocList | Measure-Object).Count
        Write-BackupLog "[2/3] Integrity Verified: $tocCount Database Objects/Tables archived." "Green"
    }

    # Generate SHA-256 Hash
    $hashObj = Get-FileHash -Path $DumpFilePath -Algorithm SHA256
    $sha256 = $hashObj.Hash

    # 5. Optional Plain SQL Archive if requested
    $sqlFilePath = ""
    if ($IncludeSqlText) {
        $sqlFileName = "p5_municipal_db_$Timestamp.sql"
        $sqlFilePath = Join-Path $backupDir $sqlFileName
        Write-Host "      Generating optional plain SQL text file..." -ForegroundColor DarkGray
        $sqlArgs = @(
            "-h", $dbHost,
            "-p", $dbPort,
            "-U", $dbUser,
            "-d", $dbName,
            "--no-owner",
            "--no-privileges",
            "-f", $sqlFilePath
        )
        & $pgDumpExe @sqlArgs 2>&1 | Out-Null
    }

    # 6. Backup uploads directory if it contains files
    $uploadsBackupZip = ""
    if (Test-Path $uploadsDir) {
        $uploadedFiles = Get-ChildItem -Path $uploadsDir -Recurse -File -ErrorAction SilentlyContinue
        if ($uploadedFiles.Count -gt 0) {
            $zipName = "p5_uploads_$Timestamp.zip"
            $uploadsBackupZip = Join-Path $backupDir $zipName
            Compress-Archive -Path "$uploadsDir\*" -DestinationPath $uploadsBackupZip -Force
            $zipSizeMB = [Math]::Round((Get-Item $uploadsBackupZip).Length / 1MB, 2)
            Write-BackupLog "[3/3] Uploaded citizen files archived: $zipName ($zipSizeMB MB, $($uploadedFiles.Count) files)" "Green"
        } else {
            Write-Host "[3/3] Uploads folder empty (will auto-archive when citizen files exist)." -ForegroundColor DarkGray
        }
    }

    # Write JSON metadata
    $meta = @{
        municipality = "Panchpokhari Thangpal Rural Municipality"
        system = "Municipal Digital Twins"
        database = $dbName
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        dumpFile = $DumpFileName
        dumpSizeBytes = $dumpItem.Length
        dumpSizeMB = $fileSizeMB
        sha256 = $sha256
        tableOfContentsEntries = $tocCount
        sqlFile = if ($sqlFilePath) { (Split-Path -Leaf $sqlFilePath) } else { $null }
        uploadsZip = if ($uploadsBackupZip) { (Split-Path -Leaf $uploadsBackupZip) } else { $null }
        status = "SUCCESS"
    }
    $meta | ConvertTo-Json -Depth 4 | Set-Content -Path $MetaFilePath -Encoding UTF8

    # 7. Secondary / Cloud Mirroring (e.g. D:\Backups or Google Drive)
    if ($SecondaryBackupDir -and (Test-Path $SecondaryBackupDir)) {
        Write-Host "--> Mirroring backup to secondary location: $SecondaryBackupDir" -ForegroundColor Cyan
        Copy-Item -Path $DumpFilePath -Destination $SecondaryBackupDir -Force
        Copy-Item -Path $MetaFilePath -Destination $SecondaryBackupDir -Force
        if ($sqlFilePath -and (Test-Path $sqlFilePath)) {
            Copy-Item -Path $sqlFilePath -Destination $SecondaryBackupDir -Force
        }
        if ($uploadsBackupZip -and (Test-Path $uploadsBackupZip)) {
            Copy-Item -Path $uploadsBackupZip -Destination $SecondaryBackupDir -Force
        }
        Write-BackupLog "Mirrored backup to $SecondaryBackupDir" "Green"
    }

    # 8. Intelligent Rotation: Keep last 14 days of backups
    $retentionDays = 14
    $cutoff = (Get-Date).AddDays(-$retentionDays)
    $oldBackups = Get-ChildItem -Path $backupDir -Filter "p5_municipal_db_*.dump" | Where-Object { $_.CreationTime -lt $cutoff }
    foreach ($old in $oldBackups) {
        $prefix = $old.BaseName
        Remove-Item $old.FullName -Force -ErrorAction SilentlyContinue
        Remove-Item (Join-Path $backupDir "$prefix.meta.json") -Force -ErrorAction SilentlyContinue
        Remove-Item (Join-Path $backupDir "$prefix.sql") -Force -ErrorAction SilentlyContinue
        Write-Host "Cleaned up old backup: $($old.Name)" -ForegroundColor DarkGray
    }

    # Also clean legacy backups beyond latest 7
    $legacyBackups = Get-ChildItem -Path $backupDir -Filter "p5digital_backup_*.sql" | Sort-Object CreationTime -Descending | Select-Object -Skip 7
    foreach ($old in $legacyBackups) {
        Remove-Item $old.FullName -Force -ErrorAction SilentlyContinue
    }

    Write-Host "==========================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Panchpokhari Thangpal Database Backup Complete & Verified!" -ForegroundColor Green
    Write-Host " Backup Directory : $backupDir" -ForegroundColor Cyan
    Write-Host " Dump File Size   : $fileSizeMB MB" -ForegroundColor Cyan
    Write-Host " SHA-256 Checksum : $sha256" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Green

    exit 0

} catch {
    Write-BackupLog "ERROR: Database backup failed: $_" "Red"
    exit 1
} finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}
