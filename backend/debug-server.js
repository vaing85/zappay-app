const http = require('http');
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('🔍 Starting Debug Server v3 - FORCE DEPLOYMENT...');
console.log('Port:', PORT);
console.log('Host:', HOST);
console.log('This is a debug server to test deployment');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Debug endpoint
  if (req.url === '/debug') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Debug server is running!',
      timestamp: new Date().toISOString(),
      version: 'debug-v1',
      environment: process.env.NODE_ENV || 'production',
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    }));
    return;
  }
  
  // Default response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Debug server v3 is running! FORCE DEPLOYMENT SUCCESS!');
});

server.listen(PORT, HOST, () => {
  console.log(`🔍 Debug Server running on ${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🐛 Debug endpoint: http://${HOST}:${PORT}/debug`);
});
