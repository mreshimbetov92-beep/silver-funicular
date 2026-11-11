@echo off
cd /d "%~dp0"
node --version >nul 2>&1
if errorlevel 1 (
  echo Avval https://nodejs.org/ dan Node.js 24 LTS o'rnating.
  pause
  exit /b 1
)
call npm run setup
if errorlevel 1 (
  pause
  exit /b 1
)
echo Brauzerda http://localhost:3000 manzilini oching.
echo Serverni to'xtatish: Ctrl+C. Ushbu oynani ochiq qoldiring.
call npm start
pause
