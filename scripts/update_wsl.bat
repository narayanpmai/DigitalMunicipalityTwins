@echo off
title WSL Update for Docker Desktop
echo ========================================================
echo Updating Windows Subsystem for Linux (WSL) for Docker...
echo ========================================================
echo.
echo A Windows Administrator prompt (UAC) will now appear.
echo Please click [Yes] to allow the update.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process msiexec.exe -ArgumentList '/i \"%TEMP%\wsl.2.7.14.0.x64.msi\" /passive /norestart' -Verb RunAs -Wait"
echo.
echo ========================================================
echo WSL update completed!
echo Starting Docker Desktop...
echo ========================================================
start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
echo Done! Please wait 15-30 seconds for Docker Desktop to finish initializing.
pause
