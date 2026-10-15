@echo off
title Start Municipal Digital Twin Backends
echo =========================================================
echo  Starting Municipal FastAPI Backend (Port 3002) & AI Service (Port 8001)
echo =========================================================

start "Municipal FastAPI (3002)" /D "%~dp0fastapi-backend" "%~dp0fastapi-backend\venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 3002
start "Municipal AI Service (8001)" /D "%~dp0ai-service" "%~dp0fastapi-backend\venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8001

echo.
echo Both backends launched successfully!
echo   - FastAPI Backend: http://127.0.0.1:3002
echo   - Swagger Docs:    http://127.0.0.1:3002/docs
echo   - AI Service:      http://127.0.0.1:8001
echo.
pause
