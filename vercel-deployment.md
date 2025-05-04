# Deploying QuickNotes to Vercel

This guide will walk you through deploying your QuickNotes application to Vercel, making it accessible online to anyone.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. The QuickNotes project files
3. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub, GitLab, or Bitbucket account)

## Step 1: Push your project to a Git repository

If your project isn't already in a Git repository:

```bash
# Navigate to your QuickNotes directory
cd MiniJobb/QuickNotes

# Initialize a new Git repository
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Create a new repository on GitHub/GitLab/Bitbucket and push to it
git remote add origin <your-repository-url>
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option 1: Deploy using the Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure your project:
   - Framework Preset: Other
   - Root Directory: `./` (or the path to your QuickNotes folder if it's in a subdirectory)
   - Build Command: Leave empty (for static sites)
   - Output Directory: Leave empty (for static sites)
5. Click "Deploy"

### Option 2: Deploy using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your QuickNotes directory:
   ```bash
   cd MiniJobb/QuickNotes
   ```

3. Run the deployment command:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Log in to Vercel if prompted
   - Set up and deploy project? Yes
   - Link to existing project? No
   - What's your project's name? quicknotes (or any name you prefer)
   - In which directory is your code located? ./
   - Want to override the settings? No

## Step 3: Access your deployed application

After deployment completes, Vercel will provide you with a URL where your application is hosted (e.g., `https://quicknotes-abc123.vercel.app`).

You can also access your project from the Vercel dashboard, where you'll find:
- The deployment URL
- Deployment history
- Analytics
- Environment variables
- Domain settings

## Important Notes for QuickNotes on Vercel

1. **LocalStorage Persistence**: Since QuickNotes uses localStorage for data storage, each user's notes will be stored in their own browser. Notes created on one device won't be accessible from another device.

2. **Custom Domain**: You can add a custom domain to your Vercel project from the Vercel dashboard under "Settings" > "Domains".

3. **Automatic Deployments**: Vercel automatically deploys changes when you push to your Git repository. To update your deployed app, simply push your changes.

4. **Environment Variables**: If you later add features that require API keys or other secrets, you can set them up in the Vercel dashboard under "Settings" > "Environment Variables".

## Troubleshooting

- If your deployment fails, check the Vercel logs for details
- Make sure all file paths in your HTML, CSS, and JavaScript files are relative
- Verify that your `vercel.json` configuration is correct

Enjoy your deployed QuickNotes application!
