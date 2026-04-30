@echo off
color 0A
echo =========================================================
echo   BARANGAY PROFILING SYSTEM - OFFLINE MODE
echo =========================================================
echo.
echo Starting Local Database and Backend Server...
start "Backend Server" cmd /c "cd backend && npm start"

echo.
echo Starting Local Frontend Interface...
start "Frontend UI" cmd /c "cd frontend && npm run dev -- --host"

echo.
echo =========================================================
echo   SYSTEM IS RUNNING IN OFFLINE MODE!
echo.
echo   Buksan ang browser at pumunta sa:
echo   http://localhost:5173
echo.
echo   Para magamit ito sa ibang cellphone o laptop na nakakabit
echo   sa parehong WiFi (kahit walang internet), gamitin ang IP address
echo   na lalabas sa Frontend UI window.
echo =========================================================
pause
