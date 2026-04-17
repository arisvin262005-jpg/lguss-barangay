@echo off
TITLE LGUSS Deployment Setup
color 0A
echo.
echo ==========================================
echo   LGUSS BARANGAY SYSTEM - DEPLOY SETUP
echo ==========================================
echo.

:: --- Check if Git is installed ---
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Git is not installed. Downloading Git for Windows...
    echo.
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.49.0.windows.1/Git-2.49.0-64-bit.exe' -OutFile '%TEMP%\GitInstaller.exe' -UseBasicParsing; Write-Host 'Download complete.' }"
    echo.
    echo [*] Installing Git silently...
    "%TEMP%\GitInstaller.exe" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"
    echo [+] Git installed successfully!
    echo.
    :: Reload PATH
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
) else (
    echo [+] Git is already installed.
)

:: --- Check Node.js ---
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js not found in PATH. Please install from https://nodejs.org
    pause
    exit /b 1
) else (
    echo [+] Node.js found.
)

echo.
echo ==========================================
echo   STEP 1: Configure Git Identity
echo ==========================================
echo.
set /p GIT_NAME="Enter your name (for git commits): "
set /p GIT_EMAIL="Enter your email (same as GitHub): "

"C:\Program Files\Git\cmd\git.exe" config --global user.name "%GIT_NAME%"
"C:\Program Files\Git\cmd\git.exe" config --global user.email "%GIT_EMAIL%"
echo [+] Git identity configured.

echo.
echo ==========================================
echo   STEP 2: Build Frontend for Production
echo ==========================================
echo.
cd /d "C:\xampp\htdocs\Profiligsystem\frontend"
echo [*] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [!] Build failed. Check errors above.
    pause
    exit /b 1
)
echo [+] Frontend built successfully!

echo.
echo ==========================================
echo   STEP 3: Initialize Git & Push to GitHub
echo ==========================================
echo.
cd /d "C:\xampp\htdocs\Profiligsystem"

:: Init if not already a git repo
"C:\Program Files\Git\cmd\git.exe" rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    "C:\Program Files\Git\cmd\git.exe" init
    "C:\Program Files\Git\cmd\git.exe" branch -M main
)

echo.
set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p GITHUB_REPO="Enter GitHub repo name (e.g. lguss-barangay): "
set GITHUB_URL=https://github.com/%GITHUB_USERNAME%/%GITHUB_REPO%.git

:: Add remote
"C:\Program Files\Git\cmd\git.exe" remote remove origin >nul 2>&1
"C:\Program Files\Git\cmd\git.exe" remote add origin %GITHUB_URL%

echo.
echo [*] Adding files and committing...
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: production deployment - LGUSS Barangay System"

echo.
echo [*] Pushing to GitHub... (You may be asked for your credentials)
echo     TIP: Use a GitHub Personal Access Token as password.
echo     Create one at: https://github.com/settings/tokens/new
echo     Select scope: repo (full control)
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Push failed. Make sure you created the GitHub repo first at:
    echo     https://github.com/new
    echo     Repo name: %GITHUB_REPO%
    echo     Set it to PUBLIC or PRIVATE (either works)
    echo     Do NOT initialize with README
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   SUCCESS! Code pushed to GitHub!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. DEPLOY BACKEND to Railway:
echo    - Go to: https://railway.app/new
echo    - Select "Deploy from GitHub repo"
echo    - Choose: %GITHUB_USERNAME%/%GITHUB_REPO%
echo    - Set Root Directory to: backend
echo    - Add environment variables (see .env.production.example)
echo.
echo 2. DEPLOY FRONTEND to Vercel:
echo    - Go to: https://vercel.com/new
echo    - Select: %GITHUB_USERNAME%/%GITHUB_REPO%
echo    - Set Root Directory to: frontend
echo    - Add env var: VITE_API_URL = (your Railway URL)
echo.
echo ==========================================
pause
