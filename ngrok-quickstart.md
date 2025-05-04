# QuickNotes with ngrok - Quick Start Guide

This guide will help you quickly set up ngrok to create a public URL for your QuickNotes application.

## Step 1: Install ngrok

Install ngrok globally using npm:

```bash
npm install -g ngrok
```

Alternatively, you can download it directly from [ngrok.com/download](https://ngrok.com/download).

## Step 2: Start your QuickNotes server

Make sure your QuickNotes server is running on port 3000:

```bash
cd MiniJobb/QuickNotes
node network-server.js
```

## Step 3: Run ngrok

In a new terminal window, run:

```bash
ngrok http 3000
```

## Step 4: Get your public URL

After running the command, you'll see output similar to this:

```
Session Status                online
Account                       [Your Email] (Plan: Free)
Version                       3.3.1
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

The URL `https://abc123.ngrok.io` is your public URL. Anyone can access your QuickNotes app using this URL!

## Step 5: Share your app

Share the ngrok URL with friends, colleagues, or anyone you want to show your QuickNotes app to. They can access it from anywhere in the world.

## Important Notes

- With the free plan, your ngrok URL will change each time you restart ngrok
- The free plan has some limitations on bandwidth and connections
- For more persistent URLs, consider upgrading to a paid plan

## Troubleshooting

- If you get "command not found", make sure ngrok is properly installed
- If ngrok fails to start, check if port 3000 is already in use
- For more help, visit [ngrok.com/docs](https://ngrok.com/docs)

Enjoy sharing your QuickNotes app with the world!
