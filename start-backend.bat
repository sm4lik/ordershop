@echo off
title OrderShop Backend Server

echo ========================================
echo   OrderShop Backend Server
echo ========================================
echo.

cd backend

if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo Run install.bat or 'npm install' in backend folder.
    pause
    exit /b 1
)

if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Copy .env.example to .env and configure database.
    echo.
)

echo Starting Backend server...
echo [INFO] API: http://localhost:3000
echo ========================================
echo.

call npm run dev

pause
