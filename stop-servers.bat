@echo off
setlocal enabledelayedexpansion
echo Stopping servers on ports 3409 (proxy) and 3410 (vite)...
for %%p in (3409 3410) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
    echo   Killing PID %%a on port %%p...
    taskkill /PID %%a /F >nul 2>&1
  )
)
echo Servers stopped.
pause
