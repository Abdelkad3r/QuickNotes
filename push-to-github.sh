#!/bin/bash

# This script pushes the QuickNotes project to GitHub
# It assumes you've already initialized a Git repository and committed your files

# Change to the QuickNotes directory
cd "$(dirname "$0")"

# Check if Git is initialized
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  
  # Add all files
  echo "Adding files to Git..."
  git add .
  
  # Commit files
  echo "Committing files..."
  git commit -m "Initial commit of QuickNotes project"
fi

# Add the remote repository
echo "Adding remote repository..."
git remote add origin https://github.com/Abdelkad3r/QuickNotes.git

# Set the branch name to main
echo "Setting branch name to main..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "If you're prompted for credentials, enter your GitHub username and password/token."
echo "Note: If you have two-factor authentication enabled, you'll need to use a personal access token instead of your password."
echo ""
echo "If the push is successful, your QuickNotes project will be available at:"
echo "https://github.com/Abdelkad3r/QuickNotes"
