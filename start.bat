@echo off
title OrderShop - Server

echo ========================================
echo   OrderShop - Starting Servers
echo ========================================
echo.

REM Check node_modules
if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not installed!
    echo Run install.bat to install dependencies.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed!
    echo Run install.bat to install dependencies.
    pause
    exit /b 1
)

echo Dependencies check passed.
echo.
echo Starting servers...
echo.
echo [INFO] Backend:  http://localhost:3000
echo [INFO] Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev

pause
