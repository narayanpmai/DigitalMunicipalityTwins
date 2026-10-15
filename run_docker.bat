@echo off
title Panchpokhari Digital Twin - Docker Runner
echo ====================================================
echo  Panchpokhari Digital Twin Platform - Docker Start
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start_docker.ps1"
pause
