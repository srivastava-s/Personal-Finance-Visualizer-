@echo off
echo Starting Personal Finance Visualizer (Next.js + MongoDB)...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Warning: .env.local not found
    echo Please copy env.example to .env.local and configure your MongoDB connection
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting development server...
echo.
echo Personal Finance Visualizer will be available at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause 