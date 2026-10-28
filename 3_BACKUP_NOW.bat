@echo off
title 3. Panchpokhari Digital Twin - Instant Database Backup
echo ==========================================================================
echo   Panchpokhari Thangpal Rural Municipality (P5 Digital Twin)
echo   Instant Database & Uploads Backup Utility
echo ==========================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\backup_db.ps1"
echo.
pause
