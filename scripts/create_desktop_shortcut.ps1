$wscript = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath("Desktop")
$shortcut = $wscript.CreateShortcut("$desktop\Municipal Digital Twin.url")
$shortcut.TargetPath = "http://localhost:8080"
$shortcut.Save()
Write-Host "Created shortcut: $desktop\Municipal Digital Twin.url"
