@echo off
echo ========================================
echo   OrderShop - Database Import
echo ========================================
echo.

REM Get DB parameters
set /p DB_HOST="DB Host (localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER="DB User (root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="DB Password: "

echo.
echo [1/3] Creating database 'ordershop'...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS ordershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database!
    echo Check MySQL connection parameters.
    pause
    exit /b 1
)
echo [OK] Database created
echo.

echo [2/3] Importing schema...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% ordershop < backend\database\schema.sql
if %errorlevel% neq 0 (
    echo [ERROR] Failed to import schema!
    pause
    exit /b 1
)
echo [OK] Schema imported
echo.

echo [3/3] Importing seed data...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% ordershop < backend\database\seed.sql
if %errorlevel% neq 0 (
    echo [ERROR] Failed to import seed data!
    pause
    exit /b 1
)
echo [OK] Seed data imported
echo.

echo ========================================
echo   Import completed successfully!
echo ========================================
echo.
echo Database 'ordershop' is ready.
echo Don't forget to configure backend/.env
echo.
pause
