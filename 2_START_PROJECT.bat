@echo off
title 2. Start Panchpokhari Digital Twin Platform
echo ====================================================
echo  Panchpokhari Digital Twin Platform - Docker Start
echo ====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start_docker.ps1"
