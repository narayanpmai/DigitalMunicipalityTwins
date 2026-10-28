# ==============================================================================
# Panchpokhari Thangpal Rural Municipality (पाँचपोखरी थाङपाल गाउँपालिका)
# Automated Windows Task Scheduler Registration for Database Backup
# Usage: powershell -ExecutionPolicy Bypass -File scripts/schedule_daily_backup.ps1
# ==============================================================================

$scriptDir = Split-Path -Parent $PSScriptRoot
$backupScript = Join-Path $scriptDir "scripts\backup_db.ps1"

if (-not (Test-Path $backupScript)) {
    Write-Host "[ERROR] Backup script not found: $backupScript" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  Panchpokhari Digital Twin - Automated Backup Scheduler Setup" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan

# 1. Register Nightly Full Backup (01:00 AM Every Night)
$nightlyTaskName = "Municipal_Database_Nightly_Backup"
$nightlyAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$backupScript`""
$nightlyTrigger = New-ScheduledTaskTrigger -Daily -At "01:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 2) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 10)

Write-Host "--> Registering Nightly Backup Task ($nightlyTaskName at 01:00 AM)..." -ForegroundColor Yellow
Register-ScheduledTask -TaskName $nightlyTaskName -Action $nightlyAction -Trigger $nightlyTrigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "    [OK] Nightly Backup registered successfully!" -ForegroundColor Green

# 2. Register Midday Backup (13:30 / 1:30 PM for Active Data Entry Shifts)
$middayTaskName = "Municipal_Database_Midday_Backup"
$middayTrigger = New-ScheduledTaskTrigger -Daily -At "13:30"

Write-Host "--> Registering Midday Backup Task ($middayTaskName at 01:30 PM)..." -ForegroundColor Yellow
Register-ScheduledTask -TaskName $middayTaskName -Action $nightlyAction -Trigger $middayTrigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "    [OK] Midday Backup registered successfully!" -ForegroundColor Green

Write-Host "`nVerifying Registered Municipal Backup Tasks:" -ForegroundColor Cyan
Get-ScheduledTask | Where-Object { $_.TaskName -like "*Municipal*Backup*" } | Select-Object TaskName, State, @{Name="NextRunTime";Expression={(Get-ScheduledTaskInfo $_).NextRunTime}} | Format-Table -AutoSize

Write-Host "==========================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Automated Backup Schedule Active for Panchpokhari Thangpal!" -ForegroundColor Green
Write-Host " - 01:00 AM : Nightly Full Backup (All Tables + Uploads)" -ForegroundColor White
Write-Host " - 01:30 PM : Midday Data Entry Snapshot" -ForegroundColor White
Write-Host "==========================================================================" -ForegroundColor Green
