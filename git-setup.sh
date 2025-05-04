#!/bin/bash

# This script initializes a Git repository and pushes the QuickNotes project to it
# You'll need to replace YOUR_GITHUB_USERNAME with your actual GitHub username

# Initialize Git repository
echo "Initializing Git repository..."
git init

# Add all files to the repository
echo "Adding files to the repository..."
git add .

# Commit the files
echo "Committing files..."
git commit -m "Initial commit of QuickNotes project"

# Create a new repository on GitHub first, then uncomment and run these commands
# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
# echo "Adding remote repository..."
# git remote add origin https://github.com/YOUR_GITHUB_USERNAME/quicknotes.git

# Push to GitHub
# echo "Pushing to GitHub..."
# git push -u origin main

echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub at: https://github.com/new"
echo "2. Name it 'quicknotes' (or any name you prefer)"
echo "3. Do NOT initialize it with a README, .gitignore, or license"
echo "4. After creating the repository, run these commands (replace YOUR_GITHUB_USERNAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/quicknotes.git"
echo "   git push -u origin main"
echo ""
echo "Your QuickNotes project will then be available on GitHub!"
