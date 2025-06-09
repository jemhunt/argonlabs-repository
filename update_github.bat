@echo off
setlocal
title Argon Labs GitHub Updater

cls
echo ====================================================
echo      ARGON LABS - GITHUB REPOSITORY UPDATER
echo ====================================================
echo.

:: --- Section 1: Check and Set Git Identity Configuration ---
echo --- Checking Git Identity Configuration ---
for /f "tokens=*" %%a in ('git config user.name') do set "GIT_USER_NAME=%%a"
for /f "tokens=*" %%b in ('git config user.email') do set "GIT_USER_EMAIL=%%b"

if not defined GIT_USER_NAME (
    echo [!] User name not set. Configuring now...
    git config --global user.name "jemhunt"
    echo     User name set to: jemhunt
) else (
    echo [*] User name is already set to: %GIT_USER_NAME%
)

if not defined GIT_USER_EMAIL (
    echo [!] User email not set. Configuring now...
    git config --global user.email "jackhuntley1992@gmail.com"
    echo     User email set to: jackhuntley1992@gmail.com
) else (
    echo [*] User email is already set to: %GIT_USER_EMAIL%
)
echo --------------------------------------------
echo.
pause
echo.

:: --- Section 2: Show Status and Get Commit Message ---
echo --- Current Status of Changes ---
git status -s
echo ---------------------------------
echo M = Modified, A = Added (Staged), ?? = Untracked
echo.

:get_message
set "commitMessage="
set /p commitMessage="Enter your commit message now: "

if not defined commitMessage (
    echo.
    echo ERROR: A commit message is required. The process has been cancelled.
    echo.
    pause
    exit /b
)

echo.
echo ====================================================
echo         EXECUTING GIT COMMANDS
echo ====================================================
echo.

:: --- Section 3: Add, Commit, and Push ---
echo --- 1. Staging all files... ---
git add .
echo Done.
echo.

echo --- 2. Committing with your message... ---
git commit -m "%commitMessage%"
echo Done.
echo.

echo --- 3. Pushing to GitHub (origin/main)... ---
git push origin main
echo.

echo ====================================================
echo      UPDATE PROCESS COMPLETE!
echo ====================================================
echo.
echo Review the output above for any errors.
echo.
pause
endlocal