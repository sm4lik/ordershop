@echo off
title OrderShop Frontend Server

echo ========================================
echo   OrderShop Frontend Server
echo ========================================
echo.

cd frontend

if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo Run install.bat or 'npm install' in frontend folder.
    pause
    exit /b 1
)

echo Starting Frontend server...
echo [INFO] App: http://localhost:5173
echo ========================================
echo.

call npm run dev

pause
