@echo off
echo ========================================
echo   OrderShop - Installing Dependencies
echo ========================================
echo.

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies!
    pause
    exit /b 1
)
echo [OK] Root dependencies installed
echo.

echo [2/4] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Backend dependencies!
    pause
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed
echo.

echo [3/4] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Frontend dependencies!
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed
echo.

echo [4/4] Checking project structure...
if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not installed!
    pause
    exit /b 1
)
if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed!
    pause
    exit /b 1
)
echo [OK] Project structure checked
echo.

echo ========================================
echo   Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create MySQL database 'ordershop'
echo 2. Import backend/database/schema.sql
echo 3. Import backend/database/seed.sql
echo 4. Configure backend/.env (DB_USER, DB_PASSWORD)
echo 5. Run start.bat
echo.
pause
