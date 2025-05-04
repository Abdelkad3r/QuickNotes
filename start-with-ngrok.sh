#!/bin/bash

# This script starts the QuickNotes server and ngrok

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok is not installed. Please install it first:"
    echo "npm install -g ngrok"
    exit 1
fi

# Start the QuickNotes server in the background
echo "Starting QuickNotes server..."
node network-server.js &
SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Start ngrok
echo "Starting ngrok..."
echo "Your public URL will appear below. Share this URL to let others access your QuickNotes app."
echo "Press Ctrl+C to stop both the server and ngrok."
ngrok http 3000

# When ngrok is stopped, also stop the server
kill $SERVER_PID
echo "Server stopped."
