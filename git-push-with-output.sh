#!/bin/bash

# This script initializes Git and pushes to GitHub, showing output for each step

# Function to run a command and display its output
run_command() {
  echo "Running: $1"
  echo "----------------------------------------"
  eval "$1"
  echo "----------------------------------------"
  echo "Command completed with exit code: $?"
  echo ""
}

# Change to the QuickNotes directory
cd "$(dirname "$0")"

# Step 1: Initialize Git
run_command "git init"

# Step 2: Add all files
run_command "git add ."

# Step 3: Configure Git user (if needed)
echo "Checking Git user configuration..."
if [ -z "$(git config user.name)" ]; then
  echo "Git user.name is not set. Please enter your name:"
  read name
  run_command "git config user.name \"$name\""
fi

if [ -z "$(git config user.email)" ]; then
  echo "Git user.email is not set. Please enter your email:"
  read email
  run_command "git config user.email \"$email\""
fi

# Step 4: Commit files
run_command "git commit -m \"Initial commit of QuickNotes project\""

# Step 5: Add the remote repository
run_command "git remote add origin https://github.com/Abdelkad3r/QuickNotes.git"

# Step 6: Set the branch name to main
run_command "git branch -M main"

# Step 7: Push to GitHub
echo "Pushing to GitHub..."
echo "You will be prompted for your GitHub username and password/token."
echo "If you have two-factor authentication enabled, use a personal access token instead of your password."
echo "----------------------------------------"
git push -u origin main
echo "----------------------------------------"
echo "Push completed with exit code: $?"

echo ""
echo "If the push was successful, your QuickNotes project is now available at:"
echo "https://github.com/Abdelkad3r/QuickNotes"
