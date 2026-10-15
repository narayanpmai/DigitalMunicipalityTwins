Import-Module WebAdministration

$poolName = "Municipal_Digital_Twins_Pool"
if (-not (Test-Path "IIS:\AppPools\$poolName")) {
    Write-Host "Creating AppPool $poolName..."
    New-Item "IIS:\AppPools\$poolName"
    Set-ItemProperty "IIS:\AppPools\$poolName" -Name "managedRuntimeVersion" -Value ""
}

$siteName = "Municipal_Digital_Twins"
$path = "c:\inetpub\wwwroot\Municipal_Digital_Twins-main\frontend\dist"

$existing = Get-Website -Name $siteName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Site $siteName already exists. Starting it..."
    Start-Website -Name $siteName
} else {
    Write-Host "Creating new IIS Site $siteName on port 8080..."
    New-Website -Name $siteName -Port 8080 -PhysicalPath $path -ApplicationPool $poolName
}

# Firewall Rule
$fwRule = Get-NetFirewallRule -DisplayName "HTTP Port 8080 (Municipal Digital Twins)" -ErrorAction SilentlyContinue
if (-not $fwRule) {
    Write-Host "Opening Port 8080 in Windows Firewall..."
    New-NetFirewallRule -DisplayName "HTTP Port 8080 (Municipal Digital Twins)" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
} else {
    Write-Host "Firewall rule for port 8080 already exists."
}

Write-Host "Checking all IIS sites:"
Get-Website | Select-Object Name, State, Id, PhysicalPath
