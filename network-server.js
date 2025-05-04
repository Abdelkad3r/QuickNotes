const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use port 3000 and bind to all interfaces
const PORT = 3000;
const HOST = '0.0.0.0';

// Get local IP addresses
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            // Skip internal and non-IPv4 addresses
            if (info.family === 'IPv4' && !info.internal) {
                addresses.push(info.address);
            }
        }
    }
    
    return addresses;
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle favicon requests
  if (req.url === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'assets', 'favicon.png');
    fs.readFile(faviconPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Favicon not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(data);
    });
    return;
  }
  
  // Normalize URL
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // Get file extension
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log('You can access the app using any of these URLs:');
  console.log(`- http://localhost:${PORT}/`);
  
  // Display all local IP addresses for easy access from other devices
  const localIPs = getLocalIPs();
  localIPs.forEach(ip => {
    console.log(`- http://${ip}:${PORT}/`);
  });
  
  console.log('\nShare any of the IP-based URLs to access from other devices on the same network');
});
