@echo off
setlocal
title Argon Labs Project Setup

echo ====================================================
echo      ARGON LABS A.I. PROJECT STRUCTURE SETUP
echo ====================================================
echo.
echo This script will create the necessary directories and empty files
echo for your modular single-page application.
echo.
echo Current Directory: %cd%
echo.
pause
echo.

echo --- Creating Core Directories ---
if not exist "css" (
    mkdir css
    echo Created: /css
) else (
    echo Exists:  /css
)
if not exist "js" (
    mkdir js
    echo Created: /js
) else (
    echo Exists:  /js
)
if not exist "modules" (
    mkdir modules
    echo Created: /modules
) else (
    echo Exists:  /modules
)
echo.

echo --- Creating Sub-directories ---
if not exist "js\modules" (
    mkdir js\modules
    echo Created: /js/modules
) else (
    echo Exists:  /js/modules
)
echo.

echo --- Creating Core HTML and JS Files ---
if not exist "index.html" (
    type nul > index.html
    echo Created: /index.html
)
if not exist "README.md" (
    type nul > README.md
    echo Created: /README.md
)
if not exist "css\style.css" (
    type nul > css\style.css
    echo Created: /css/style.css
)
if not exist "js\main.js" (
    type nul > js\main.js
    echo Created: /js/main.js
)
echo.

echo --- Creating Module HTML Fragments ---
type nul > modules\analysis-tool.html
echo Created: /modules/analysis-tool.html

type nul > modules\document-archive.html
echo Created: /modules/document-archive.html

type nul > modules\fee-estimator.html
echo Created: /modules/fee-estimator.html

type nul > modules\compliance-generator.html
echo Created: /modules/compliance-generator.html

type nul > modules\team-settings.html
echo Created: /modules/team-settings.html
echo.

echo --- Creating Module-specific JS Stubs ---
type nul > js\modules\analysis-tool.js
echo Created: /js/modules/analysis-tool.js
echo.

echo ====================================================
echo         SETUP COMPLETE!
echo ====================================================
echo.
echo Your project structure is ready.
echo Next steps:
echo 1. Populate 'index.html' with the main app shell.
echo 2. Copy the CSS into 'css/style.css'.
echo 3. Populate 'js/main.js' with the module loader script.
echo 4. Copy each tool's HTML into its corresponding file in the '/modules' folder.
echo 5. Copy the Analysis Tool's JS into 'js/modules/analysis-tool.js'.
echo 6. Use 'git add .', 'git commit -m "Initial project structure"', and 'git push' to save your work.
echo.
pause
endlocal