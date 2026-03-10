@echo off
setlocal
echo ==========================================
echo   Ace It! - CLEAN START SCRIPT
echo ==========================================

:: 1. Force kill any existing Node/Vite processes on our ports
echo Cleaning up existing processes (Ports 3001, 3005)...
npx kill-port 3001 3005 >nul 2>&1

:: 2. Start Backend
echo Starting Backend (Port 3001)...
start "Ace It Backend" cmd /k "cd backend && npm run dev"

:: 3. Wait a moment for backend to initialize
timeout /t 2 /nobreak >nul

:: 4. Start Frontend
echo Starting Frontend (Port 3005)...
:: Force 127.0.0.1 to avoid some Windows IPv6/localhost conflicts
start "Ace It Frontend" cmd /k "cd frontend && npx vite --port 3005 --host 127.0.0.1"

echo.
echo ==========================================
echo   SUCCESS! Servers are launching.
echo ==========================================
echo.
echo FRONTEND: http://localhost:3005
echo BACKEND:  http://localhost:3001
echo.
echo Leave the two new windows open while working!
echo ==========================================
echo.
pause
