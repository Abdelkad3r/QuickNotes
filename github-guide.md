# Pushing QuickNotes to GitHub

This guide will walk you through the process of creating a Git repository for your QuickNotes project and pushing it to GitHub.

## Prerequisites

1. Git installed on your computer
2. A GitHub account
3. The QuickNotes project files

## Step 1: Initialize a Git Repository

First, navigate to your QuickNotes directory and initialize a Git repository:

```bash
cd MiniJobb/QuickNotes
git init
```

## Step 2: Add Your Files to the Repository

Add all the project files to the repository:

```bash
git add .
```

## Step 3: Commit Your Files

Commit the files with a descriptive message:

```bash
git commit -m "Initial commit of QuickNotes project"
```

## Step 4: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "quicknotes")
4. Add an optional description
5. Choose whether to make it public or private
6. **Important**: Do NOT initialize the repository with a README, .gitignore, or license
7. Click "Create repository"

## Step 5: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands to push an existing repository. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/quicknotes.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

If you're using a personal access token instead of password authentication:

```bash
git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/quicknotes.git
git push -u origin main
```

## Step 6: Verify Your Repository

1. Go to `https://github.com/YOUR_USERNAME/quicknotes`
2. You should see all your QuickNotes files in the repository

## Next Steps

Now that your QuickNotes project is on GitHub, you can:

1. **Deploy to Vercel**: Follow the [Vercel deployment guide](vercel-guide.html) to deploy your app
2. **Share with others**: Send them the GitHub repository URL
3. **Collaborate**: Add collaborators to your repository
4. **Track changes**: Use Git to track changes to your project

## Common Issues and Solutions

### "fatal: not a git repository"
- Make sure you're in the correct directory
- Run `git init` to initialize the repository

### "fatal: remote origin already exists"
- If you've already added a remote, you can remove it with:
  ```bash
  git remote remove origin
  ```
- Then add the new remote

### "Authentication failed"
- Make sure you're using the correct username and password/token
- If you're using GitHub, you might need to use a personal access token instead of your password

### "rejected: main -> main (fetch first)"
- This happens if the remote repository has changes that aren't in your local repository
- Pull the changes first:
  ```bash
  git pull origin main --allow-unrelated-histories
  ```
- Then push your changes

## Using the Provided Script

For convenience, a script has been provided to help you set up Git:

```bash
./git-setup.sh
```

This script will initialize the repository, add all files, and commit them. You'll still need to create the GitHub repository and add the remote manually.
