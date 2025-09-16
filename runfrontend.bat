@echo off
echo Running frontend...

REM Navigate to frontend directory
cd /d P:\Programs\NoSh\collaborative-notes-frontend
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to enter frontend directory
    exit /b 1
)

REM Install dependencies with pnpm
REM pnpm install

REM Run Next.js development server
pnpm run dev

echo Frontend is running...