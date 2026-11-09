@echo off
title HandoverIQ Frontend (Next.js :3000)
cd /d d:\Handoveriq\frontend
echo ===================================================
echo   Starting HandoverIQ Frontend on http://localhost:3000
echo ===================================================
node node_modules\next\dist\bin\next dev --port 3000
if %errorlevel% neq 0 pause
