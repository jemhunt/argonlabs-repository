@echo off
setlocal enabledelayedexpansion

title Argon Labs Application Builder v2

cls
echo =======================================================
echo      ARGON LABS - SINGLE FILE BUILDER (v2)
echo =======================================================
echo.
echo This script will build a single, self-contained HTML
echo file from your modular project source.
echo.

:: --- Setup ---
if not exist "dist" mkdir dist
set "OUTPUT_FILE=dist\Argon_Labs_App.html"
set "SHELL_FILE=index.html"
set "CSS_FILE=css\style.css"
set "MAIN_JS_FILE=js\main.js"

del "%OUTPUT_FILE%" 2>nul
echo [*] Starting build...

:: --- Process File Line by Line ---
for /f "usebackq tokens=* delims=" %%L in ("%SHELL_FILE%") do (
    set "line=%%L"

    :: Check for CSS link placeholder
    if "!line:href="css/style.css"=!" neq "!line!" (
        echo [*] Injecting CSS styles...
        (echo   ^<style^>) >> "%OUTPUT_FILE%"
        (type "%CSS_FILE%") >> "%OUTPUT_FILE%"
        (echo   ^</style^>) >> "%OUTPUT_FILE%"
    ) ^
    else if "!line:id="main-content-container"=!" neq "!line!" (
        :: Check for Main Content placeholder
        echo [*] Injecting page modules...
        (echo     ^<main class="main-content"^>) >> "%OUTPUT_FILE%"
        for %%M in (modules\*.html) do (
            echo      - Adding module: %%M
            (type "%%M") >> "%OUTPUT_FILE%"
        )
        (echo     ^</main^>) >> "%OUTPUT_FILE%"
    ) ^
    else if "!line:src="js/main.js"=!" neq "!line!" (
        :: Check for Main JS placeholder
        echo [*] Injecting JavaScript...
        (echo   ^<script^>) >> "%OUTPUT_FILE%"
        
        echo      - Injecting master navigation/logic...
        (type "%MAIN_JS_FILE%") >> "%OUTPUT_FILE%"
        
        echo      - Injecting module-specific scripts...
        for %%S in (js\modules\*.js) do (
            echo      - Adding script: %%S
            (type "%%S") >> "%OUTPUT_FILE%"
        )
        
        (echo   ^</script^>) >> "%OUTPUT_FILE%"
    ) ^
    else (
        :: If it's not a placeholder, just write the line
        (echo !line!) >> "%OUTPUT_FILE%"
    )
)

echo.
echo =======================================================
echo      BUILD COMPLETE!
echo =======================================================
echo.
echo The new self-contained file has been created at:
echo %cd%\dist\Argon_Labs_App.html
echo.
echo You can now double-click that file to open it in your browser.
echo.
pause