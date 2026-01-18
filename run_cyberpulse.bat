@echo off
title CyberPulse Dashboard Launcher
echo ============================================
echo   CYBERPULSE: SECURITY INTELLIGENCE FEED
echo ============================================
echo.

:: Ensure we are in the script's directory
pushd "%~dp0"

:: Check if Python is available to serve the file (prevents CORS issues)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SYSTEM] Python detected. Starting CyberPulse server...
    echo [SYSTEM] Dashboard will open at http://localhost:8085
    echo [SYSTEM] Keep this window open while using the dashboard.
    echo.
    start "" "http://localhost:8085"
    python -m http.server 8085
) else (
    echo [SYSTEM] Python not found. Opening index.html directly...
    echo [NOTICE] If data feeds don't load, please run this using a local web server.
    echo.
    start "" "index.html"
    pause
)
popd
