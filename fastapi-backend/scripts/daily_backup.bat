@echo off
REM ==============================================================================
REM Municipal Digital Twins - Automated Database Backup Task
REM ==============================================================================
set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%..

echo [%DATE% %TIME%] Starting Municipal Twin DB automated backup...
.\venv\Scripts\python.exe scripts\db_backup.py backup

if %ERRORLEVEL% EQU 0 (
    echo [%DATE% %TIME%] Backup completed successfully.
) else (
    echo [%DATE% %TIME%] Backup failed with exit code %ERRORLEVEL%.
)
