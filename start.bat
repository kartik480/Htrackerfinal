@echo off
echo Starting Habit Tracker Application...
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
pause
