# Preparing QuickNotes for Vercel Deployment

This guide will help you prepare your QuickNotes project for deployment to Vercel.

## Step 1: Ensure all file paths are relative

Vercel works best with relative file paths. Check your HTML, CSS, and JavaScript files to make sure all paths are relative:

- ✅ Good: `src="js/app.js"`, `href="css/styles.css"`
- ❌ Bad: `src="/js/app.js"`, `href="/css/styles.css"` (leading slash makes it absolute)

## Step 2: Include the vercel.json configuration file

The `vercel.json` file helps Vercel understand how to build and serve your project. Make sure this file is in your project root:

```json
{
  "version": 2,
  "name": "quicknotes",
  "builds": [
    { "src": "*.html", "use": "@vercel/static" },
    { "src": "css/**", "use": "@vercel/static" },
    { "src": "js/**", "use": "@vercel/static" },
    { "src": "assets/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

## Step 3: Organize your project files

Vercel works best with a clean project structure. Your QuickNotes project should be organized like this:

```
QuickNotes/
├── index.html
├── vercel.json
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── assets/
    └── favicon.png
```

## Step 4: Test locally before deploying

Before deploying to Vercel, test your app locally to make sure everything works:

1. Open `index.html` directly in your browser
2. Check that all styles are applied correctly
3. Verify that all JavaScript functionality works
4. Test all features (creating notes, editing, deleting, searching, etc.)

## Step 5: Create a Git repository (optional but recommended)

While you can deploy directly to Vercel without a Git repository, using one makes updates easier:

1. Create a repository on GitHub, GitLab, or Bitbucket
2. Push your QuickNotes project to the repository
3. Connect the repository to Vercel for automatic deployments

## Step 6: Prepare for deployment

Before deploying, make sure:

1. All files are committed to your repository (if using Git)
2. The `vercel.json` file is included
3. You have a Vercel account ready
4. You've decided whether to use the Vercel CLI or web interface

## Next Steps

Once your project is prepared, you can deploy to Vercel using either:

- The [web interface](vercel-web-deployment.md) (easiest method)
- The [Vercel CLI](vercel-deployment.md) (more control)

Choose the method that works best for you and follow the corresponding guide.
