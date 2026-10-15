# Register Unified Watchdog Task for Municipal Digital Twins
$scriptPath = "C:\inetpub\wwwroot\Municipal_Digital_Twins-main\scripts\start_backends.ps1"

# 1. Clean up legacy individual tasks if they exist
$legacyTasks = @("Municipal_FastAPI_3002", "Municipal_AIService_8001")
foreach ($t in $legacyTasks) {
    $exists = Get-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue
    if ($exists) {
        Write-Host "Stopping and unregistering legacy task: $t"
        Stop-ScheduledTask -TaskName $t -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue
    }
}

# 2. Register Unified Watchdog Task
$taskName = "Municipal_Backends"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)

Write-Host "Registering task: $taskName"
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
Start-ScheduledTask -TaskName $taskName

Write-Host "Task $taskName registered and started!"
Start-Sleep -Seconds 5

Write-Host "`nChecking ports:"
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3001, 3002, 8000, 8001, 80, 8080 } | Select-Object LocalAddress, LocalPort, OwningProcess | Sort-Object LocalPort | Format-Table -AutoSize
