@echo off
color 0B
echo =========================================================
echo   BARANGAY PROFILING SYSTEM - OFFLINE INSTALLER
echo =========================================================
echo.
echo Installing Backend Requirements...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Requirements...
cd frontend
call npm install
cd ..

echo.
echo =========================================================
echo   INSTALLATION COMPLETE! 
echo   Ang system ay handa na. Pwede mo nang buksan ang
echo   START_OFFLINE_SYSTEM.bat para gamitin ang system.
echo =========================================================
pause
