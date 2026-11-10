@echo off
cd /d "%~dp0"
start "" "http://localhost:8000/"
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -m http.server 8000 --directory public
) else (
  python -m http.server 8000 --directory public
)
pause
