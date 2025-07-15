@echo off
echo Stopping MongoDB Docker containers...
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running.
    pause
    exit /b 1
)

REM Stop Docker containers
echo Stopping containers...
docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ✅ Containers stopped successfully!
    echo.
    echo To start again, run: scripts\start-docker.bat
    echo To remove all data, run: docker-compose down -v
) else (
    echo.
    echo ❌ Failed to stop containers.
    echo Please check the error messages above.
)

echo.
echo Press any key to exit...
pause >nul