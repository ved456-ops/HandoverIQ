@echo off
echo ===================================================
echo   Launching HandoverIQ (Backend + Frontend)
echo ===================================================
start "HandoverIQ Backend" cmd /k "d:\Handoveriq\start-backend.bat"
start "HandoverIQ Frontend" cmd /k "d:\Handoveriq\start-frontend.bat"
echo.
echo Both servers have been launched in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
