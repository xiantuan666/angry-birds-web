@echo off
cd /d "%~dp0"
echo ============================================
echo   Slingshot - Angry Birds style web game
echo   One-click launcher
echo ============================================
set "NODE_DIR=C:\Users\xiantuan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
set "PATH=%NODE_DIR%;%PATH%"
set "PNPM=C:\Users\xiantuan\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"

if not exist node_modules (
  echo First run: installing dependencies (all on D drive)...
  call "%PNPM%" install
)

echo Starting dev server... browser opens at http://localhost:5173 in 3s
start "SlingshotBrowser" cmd /c "timeout /t 3 >nul & start http://localhost:5173"
call "%PNPM%" dev --port 5173 --strictPort
echo.
echo Server stopped.
pause
