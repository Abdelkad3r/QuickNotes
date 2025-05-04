#!/bin/bash

# This script helps deploy QuickNotes to Vercel

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

echo "=== QuickNotes Vercel Deployment ==="
echo "This script will help you deploy QuickNotes to Vercel."
echo "Make sure you have a Vercel account and are logged in."
echo ""

# Check if user is logged in to Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You need to log in to Vercel first."
    vercel login
fi

echo "Starting deployment process..."
echo "You'll be asked a few questions by the Vercel CLI."
echo "For most questions, you can accept the default values."
echo ""

# Run Vercel deployment
vercel

echo ""
echo "Deployment complete! Your QuickNotes app should now be available online."
echo "You can find the URL in the output above or in your Vercel dashboard."
echo ""
echo "To make further deployments, simply run 'vercel' in this directory,"
echo "or set up automatic deployments by pushing to a Git repository."
