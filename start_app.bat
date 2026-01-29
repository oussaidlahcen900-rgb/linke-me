@echo off
title Linke-Me Server
echo Starting Linke-Me Development Server...
echo.
echo 1. Opening your default browser to http://localhost:3000
echo 2. Starting the background server (this window must stay open)
echo.

:: Open the browser immediately
start http://localhost:3000

:: Change to the directory where this script is located
cd /d "%~dp0"

:: Run the development server
npm run dev

:: Keep window open if it crashes
pause
