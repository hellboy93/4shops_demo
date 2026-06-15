@echo off
cd /d "%~dp0"
set PORT=8080
where python >nul 2>nul
if errorlevel 1 (
  echo Python not found. Install Python 3 or open index.html in Chrome.
  pause
  exit /b 1
)
start http://127.0.0.1:%PORT%/
python -m http.server %PORT%
