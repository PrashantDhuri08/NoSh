@echo off
echo Running backend...

REM Navigate to backend directory
cd /d P:\Programs\NoSh\backend
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to enter backend directory
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Navigate to app directory
cd app

REM Run FastAPI with Uvicorn
uvicorn main:app --reload

echo Backend is running...