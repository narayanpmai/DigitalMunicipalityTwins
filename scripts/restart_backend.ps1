$connections = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}
Start-Sleep -Seconds 1
$pythonPath = "C:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend\venv\Scripts\python.exe"
$workingDir = "C:\inetpub\wwwroot\Municipal_Digital_Twins-main\fastapi-backend"
Start-Process -FilePath $pythonPath -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 3002" -WorkingDirectory $workingDir -WindowStyle Hidden
Start-Sleep -Seconds 3
$active = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction SilentlyContinue
if ($active) {
    Write-Output "Backend restarted successfully on port 3002 (PID: $($active.OwningProcess))"
} else {
    Write-Output "Backend did not start on port 3002"
}
