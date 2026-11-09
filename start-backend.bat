@echo off
title HandoverIQ Backend (FastAPI :8000)
cd /d d:\Handoveriq\backend
echo ===================================================
echo   Starting HandoverIQ Backend on http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ===================================================
C:\Users\Ved\AppData\Local\Programs\Python\Python313\python.exe -m uvicorn app.main:app --reload --port 8000
if %errorlevel% neq 0 pause
