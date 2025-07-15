@echo off
echo Starting MongoDB Docker containers...
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running.
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

REM Start Docker containers
echo Starting MongoDB and Mongo Express containers...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ Containers started successfully!
    echo.
    echo 📊 MongoDB:
    echo    - Host: localhost:27018
    echo    - Database: dpmptsp_db
    echo    - Username: admin
    echo    - Password: password123
    echo.
    echo 🌐 Mongo Express (Web Interface):
    echo    - URL: http://localhost:8081
    echo    - Username: admin
    echo    - Password: admin123
    echo.
    echo 🚀 You can now start the Next.js application with: npm run dev
    echo.
    
    REM Check container status
    echo Container Status:
    docker-compose ps
) else (
    echo.
    echo ❌ Failed to start containers.
    echo Please check the error messages above.
)

echo.
echo Press any key to exit...
pause >nul