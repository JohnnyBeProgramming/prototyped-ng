@echo off
setlocal ENABLEEXTENSIONS
set basePath=%~dp0

if not exist "%APPDATA%\npm\node_modules\ungit" npm update -g ungit

echo Starting UnGit...
echo  - Path: "%basePath%"

pushd "%basePath%"
call ungit
popd

pause