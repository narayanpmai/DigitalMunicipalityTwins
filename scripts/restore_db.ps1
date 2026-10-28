# ==============================================================================
# Panchpokhari Thangpal Rural Municipality (पाँचपोखरी थाङपाल गाउँपालिका)
# PostGIS Database Restore Utility
# Usage: powershell -ExecutionPolicy Bypass -File scripts/restore_db.ps1 [-BackupFile <file>] [-Force]
# ==============================================================================

param (
    [string]$BackupFile = "",
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $PSScriptRoot
$backupDir = Join-Path $baseDir "backups"
$backendDir = Join-Path $baseDir "fastapi-backend"
$envFile = Join-Path $backendDir ".env"

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
        }
    }
}

# 2. Locate PostgreSQL tools
$pgBinDir = ""
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\13\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\Program Files\PostgreSQL\15\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\17\bin"
)

foreach ($path in $possiblePaths) {
    if (Test-Path (Join-Path $path "pg_restore.exe")) {
        $pgBinDir = $path
        break
    }
}

if (-not $pgBinDir) {
    $cmd = Get-Command "pg_restore.exe" -ErrorAction SilentlyContinue
    if ($cmd) {
        $pgBinDir = Split-Path -Parent $cmd.Source
    }
}

if (-not $pgBinDir) {
    Write-Host "[ERROR] pg_restore.exe could not be found. Check PostgreSQL installation." -ForegroundColor Red
    exit 1
}

$pgRestoreExe = Join-Path $pgBinDir "pg_restore.exe"
$psqlExe = Join-Path $pgBinDir "psql.exe"

# 3. Determine Backup File
if (-not $BackupFile) {
    $latestDump = Get-ChildItem -Path $backupDir -Filter "p5_municipal_db_*.dump" | Sort-Object CreationTime -Descending | Select-Object -First 1
    if ($latestDump) {
        $BackupFile = $latestDump.FullName
    } else {
        $latestSql = Get-ChildItem -Path $backupDir -Filter "*.sql" | Sort-Object CreationTime -Descending | Select-Object -First 1
        if ($latestSql) {
            $BackupFile = $latestSql.FullName
        }
    }
}

if (-not $BackupFile -or -not (Test-Path $BackupFile)) {
    Write-Host "[ERROR] No valid backup file found at: $BackupFile" -ForegroundColor Red
    exit 1
}

$fileItem = Get-Item $BackupFile
$fileSizeMB = [Math]::Round($fileItem.Length / 1MB, 2)

Write-Host "==========================================================================" -ForegroundColor Red
Write-Host "  पाँचपोखरी थाङपाल गाउँपालिका — डाटाबेस पुनर्स्थापना (Database Restore)" -ForegroundColor Yellow
Write-Host "  Panchpokhari Digital Twin Platform - Disaster Recovery Utility" -ForegroundColor Yellow
Write-Host "==========================================================================" -ForegroundColor Red
Write-Host "Target Database : $dbName"
Write-Host "Host & Port     : $dbHost`:$dbPort"
Write-Host "User            : $dbUser"
Write-Host "Source Backup   : $($fileItem.Name) ($fileSizeMB MB)"
Write-Host "Backup Created  : $($fileItem.CreationTime.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "--------------------------------------------------------------------------"
Write-Host "[WARNING] This will overwrite live data in '$dbName' with this backup snapshot!" -ForegroundColor Yellow

if (-not $Force) {
    $confirmation = Read-Host "Are you sure you want to proceed with restore? Type 'YES' to continue"
    if ($confirmation -ne "YES") {
        Write-Host "Restore operation aborted by user." -ForegroundColor DarkGray
        exit 0
    }
}

$env:PGPASSWORD = $dbPass

try {
    Write-Host "--> [1/3] Terminating active client connections to allow restore..." -ForegroundColor Yellow
    $termSql = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$dbName' AND pid <> pg_backend_pid();"
    & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d postgres -c $termSql 2>&1 | Out-Null

    Write-Host "--> [2/3] Restoring database objects from snapshot..." -ForegroundColor Yellow

    if ($BackupFile.EndsWith(".dump")) {
        $restoreArgs = @(
            "-h", $dbHost,
            "-p", $dbPort,
            "-U", $dbUser,
            "-d", $dbName,
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            $BackupFile
        )
        & $pgRestoreExe @restoreArgs 2>&1 | Out-Null
    } else {
        & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $BackupFile 2>&1 | Out-Null
    }

    Write-Host "--> [3/3] Verifying database integrity after restore..." -ForegroundColor Yellow
    $verifySql = "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
    $tableCountOutput = & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -A -c $verifySql 2>$null
    $tableCount = $tableCountOutput.Trim()

    Write-Host "==========================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Database restored successfully!" -ForegroundColor Green
    Write-Host " Active Tables Verified : $tableCount tables in 'public' schema" -ForegroundColor Cyan
    Write-Host " Restored From          : $($fileItem.Name)" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Green

    exit 0

} catch {
    Write-Host "`n[ERROR] Database restore failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}
