@echo off
title Step 1: Enable Virtualization and WSL for Docker Desktop
echo ========================================================
echo  Step 1: Enabling Virtual Machine Platform and WSL 2
echo ========================================================
echo.

:: Check for Administrative privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Administrator permissions required.
    echo Launching with Administrator privileges...
    echo Please click [YES] on the Windows UAC permission prompt!
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/k \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo [1/4] Enabling Windows Optional Feature: VirtualMachinePlatform...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

echo.
echo [2/4] Enabling Windows Optional Feature: Microsoft-Windows-Subsystem-Linux...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

echo.
echo [3/4] Installing WSL 2 Linux Kernel Package (install_wsl_update.msi)...
if exist "%~dp0install_wsl_update.msi" (
    msiexec.exe /i "%~dp0install_wsl_update.msi" /passive /norestart
    echo WSL 2 Linux Kernel installed successfully.
) else (
    echo [INFO] MSI file not found, updating via wsl.exe...
    wsl.exe --update
)

echo.
echo [4/4] Restarting Docker Desktop...
taskkill /F /IM "Docker Desktop.exe" /T 2>nul
taskkill /F /IM "com.docker.backend.exe" /T 2>nul
timeout /t 3 /nobreak >nul
start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"

echo.
echo ========================================================
echo  Step 1 Complete!
echo ========================================================
echo.
echo CRITICAL STEP:
echo If this is the FIRST time enabling Virtual Machine Platform on this PC,
echo Windows requires a RESTART before Docker Desktop can start its Linux engine.
echo.
echo  - If Docker Desktop starts and turns GREEN:
echo    Double-click: 2_START_PROJECT.bat
echo.
echo  - If Docker Desktop still gives a 500 error:
echo    RESTART your computer, then launch 2_START_PROJECT.bat!
echo ========================================================
echo.
pause


