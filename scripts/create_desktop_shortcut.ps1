$wscript = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath("Desktop")
$baseDir = Split-Path -Parent $PSScriptRoot

# 1. Municipal Portal Shortcut
$shortcutPortal = $wscript.CreateShortcut("$desktop\Municipal Digital Twin.url")
$shortcutPortal.TargetPath = "http://localhost:8080"
$shortcutPortal.Save()
Write-Host "Created shortcut: $desktop\Municipal Digital Twin.url" -ForegroundColor Green

# 2. Database Backup Shortcut
$backupBat = Join-Path $baseDir "3_BACKUP_NOW.bat"
if (Test-Path $backupBat) {
    $shortcutBackup = $wscript.CreateShortcut("$desktop\P5 Digital Twin - Backup Now.lnk")
    $shortcutBackup.TargetPath = $backupBat
    $shortcutBackup.WorkingDirectory = $baseDir
    $shortcutBackup.Description = "One-click Database Backup for Panchpokhari Thangpal Digital Twin"
    $shortcutBackup.Save()
    Write-Host "Created shortcut: $desktop\P5 Digital Twin - Backup Now.lnk" -ForegroundColor Green
}
