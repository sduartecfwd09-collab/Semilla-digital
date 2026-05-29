@echo off
cd /d "%~dp0"
node scripts\seedProductores.ts %*
exit /b %ERRORLEVEL%
