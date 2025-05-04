#!/bin/bash

# This script starts both the backend server and a simple HTTP server for the frontend

# Start the backend server
echo "Starting QuickNotes backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Go back to the main directory
cd ..

# Start a simple HTTP server for the frontend
echo "Starting frontend server..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "QuickNotes is now running!"
echo "- Backend API: http://localhost:5000/api"
echo "- Frontend: http://localhost:8000"
echo ""
echo "Open http://localhost:8000/index-with-backend.html in your browser to use the full-stack version"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Servers stopped.'; exit" INT
wait
