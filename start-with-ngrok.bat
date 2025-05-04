@echo off
echo Starting QuickNotes with ngrok...

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ngrok is not installed. Please install it first:
    echo npm install -g ngrok
    exit /b 1
)

REM Start the QuickNotes server in a new window
start cmd /k "node network-server.js"

REM Give the server a moment to start
timeout /t 2 /nobreak >nul

REM Start ngrok
echo Starting ngrok...
echo Your public URL will appear below. Share this URL to let others access your QuickNotes app.
echo Press Ctrl+C to stop ngrok. You'll need to close the server window manually.
ngrok http 3000
