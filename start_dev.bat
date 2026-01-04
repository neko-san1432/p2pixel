@echo off
set "VCVARS=C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

if exist "%VCVARS%" (
    echo [INFO] Found Visual Studio Build Tools.
    call "%VCVARS%"
) else (
    echo [ERROR] Could not find vcvars64.bat at:
    echo %VCVARS%
    echo Please edit this file to point to your Visual Studio installation.
    pause
    exit /b 1
)

echo [INFO] Environment ready. Starting App...
call npm run tauri dev
if %errorlevel% neq 0 (
    echo [ERROR] App crashed or failed to build.
    pause
)
