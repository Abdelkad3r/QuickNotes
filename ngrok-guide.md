# Running QuickNotes with ngrok

This guide will help you expose your locally running QuickNotes app to the internet using ngrok.

## What is ngrok?

ngrok is a tool that creates a secure tunnel to expose a local web server to the internet. It gives you a public URL that anyone can access, even if they're not on your local network.

## Step 1: Install ngrok

### macOS (using Homebrew)
```bash
brew install ngrok
```

### macOS/Linux (manual installation)
```bash
# Download the zip file
curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip

# Unzip the file
unzip ngrok-v3-stable-darwin-amd64.zip

# Move to a location in your PATH (optional)
sudo mv ngrok /usr/local/bin
```

### Windows
1. Download ngrok from https://ngrok.com/download
2. Extract the zip file
3. Optionally add the ngrok.exe location to your PATH

## Step 2: Sign up for ngrok

1. Go to https://ngrok.com/ and sign up for a free account
2. After signing up, you'll get an authtoken
3. Configure ngrok with your authtoken:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## Step 3: Start the QuickNotes server

Make sure your QuickNotes server is running on port 3000:

```bash
cd MiniJobb/QuickNotes
node network-server.js
```

## Step 4: Start ngrok

In a new terminal window, run:

```bash
ngrok http 3000
```

You should see output similar to this:

```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.3.1
Region                        United States (us)
Latency                       24ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abcd-123-456-789-10.ngrok.io -> http://localhost:3000
```

## Step 5: Access your app

The forwarding URL (https://abcd-123-456-789-10.ngrok.io in the example above) is your public URL. Anyone can access your QuickNotes app using this URL, from anywhere in the world!

## Important Notes

1. **Free tier limitations**: The free tier of ngrok has some limitations:
   - The URL changes each time you restart ngrok
   - Limited number of connections
   - No custom domains

2. **Security considerations**: When you expose your app with ngrok, anyone with the URL can access it. Be careful with sensitive data.

3. **Web Interface**: ngrok provides a web interface at http://127.0.0.1:4040 where you can inspect all the HTTP traffic going through your tunnel.

## Troubleshooting

1. **"command not found"**: If you get this error, make sure ngrok is installed and in your PATH.

2. **"failed to start tunnel"**: This usually means the port is already in use. Make sure your QuickNotes server is running on port 3000 and no other service is using that port.

3. **"ERR_NGROK_..."**: These are specific ngrok errors. Check the ngrok documentation or run `ngrok http --help` for more information.

## Using ngrok with QuickNotes

Once your QuickNotes app is exposed via ngrok, you can:

1. **Share with friends**: Send them the ngrok URL to let them try your app
2. **Test on different devices**: Access your app from any device with internet access
3. **Demo your project**: Show your app to others without deploying it to a hosting service

Enjoy sharing your QuickNotes app with the world!
