# Deploying QuickNotes to Render

This guide will walk you through deploying the QuickNotes application to Render.

## Prerequisites

1. A GitHub account with your QuickNotes repository
2. A Render account (sign up at [render.com](https://render.com))
3. A MongoDB Atlas account for the database (or any MongoDB provider)

## Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account or log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. Set up database access:
   - Create a database user with password authentication
   - Note down the username and password
4. Set up network access:
   - Add `0.0.0.0/0` to allow access from anywhere (for simplicity)
5. Get your connection string:
   - Go to "Clusters" > "Connect" > "Connect your application"
   - Copy the connection string (it will look like `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with `quicknotes`

## Step 2: Deploy to Render using the Dashboard

### Deploy the Backend API

1. Log in to your Render account
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `quicknotes-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: (generate a random string or use Render's auto-generate feature)
   - `MONGO_URI`: (your MongoDB Atlas connection string from Step 1)
6. Click "Create Web Service"

### Deploy the Frontend

1. In your Render dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `quicknotes-frontend`
   - **Build Command**: (leave empty or use `echo "No build step needed"`)
   - **Publish Directory**: `.`
4. Add environment variables:
   - `API_URL`: (the URL of your backend API service, e.g., `https://quicknotes-api.onrender.com/api`)
5. Click "Create Static Site"

## Step 3: Update CORS Settings (if needed)

If you encounter CORS issues, you may need to update your backend code to allow requests from your frontend domain:

```javascript
// In backend/server.js
app.use(cors({
  origin: ['https://quicknotes-frontend.onrender.com', 'http://localhost:8000']
}));
```

## Step 4: Verify Deployment

1. Wait for both services to deploy (this may take a few minutes)
2. Visit your frontend URL (e.g., `https://quicknotes-frontend.onrender.com`)
3. Try registering a new account and creating notes
4. Check that notes are being saved to the database

## Troubleshooting

### Backend Issues

- Check the Render logs for any errors
- Verify that your MongoDB connection string is correct
- Make sure all environment variables are set correctly

### Frontend Issues

- Check the browser console for any errors
- Verify that the API_URL environment variable is set correctly
- Try clearing your browser cache

## Using the render.yaml File (Alternative Approach)

If you prefer to use Infrastructure as Code, you can use the `render.yaml` file included in the repository:

1. In your Render dashboard, go to "Blueprints"
2. Click "New Blueprint Instance"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create the services
5. You'll still need to set the `MONGO_URI` environment variable manually

## Updating Your Deployment

When you push changes to your GitHub repository, Render will automatically redeploy your services if you have enabled auto-deploy.
