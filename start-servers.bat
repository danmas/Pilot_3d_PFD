@echo off
echo Starting servers...
call stop-servers.bat >nul 2>&1
cd /d "%~dp0"
echo Starting Terrain Proxy (port 3409)...
start "Terrain-Proxy-3409" cmd /k "cd /d %~dp0 && node server/terrain-proxy.js"
timeout /t 2 >nul
echo Starting Vite Dev Server (port 3410)...
start "Vite-Dev-3410" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo Servers launched in separate windows.
echo Open browser at: http://localhost:3410
echo To stop: run stop-servers.bat (as Administrator if needed for stubborn PIDs)
pause
