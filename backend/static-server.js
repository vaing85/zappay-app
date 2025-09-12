#!/usr/bin/env node

/**
 * Static Response Server
 * Returns static responses - no dynamic logic that can fail
 */

const http = require('http');

const PORT = process.env.PORT || process.env.DO_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting Static Response Server...');
console.log(`   Port: ${PORT}`);
console.log(`   Host: ${HOST}`);

const server = http.createServer((req, res) => {
  // Set basic headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint - STATIC RESPONSE
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Root endpoint - STATIC RESPONSE
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ZapPay API Server - Running');
    return;
  }
  
  // 404 for everything else - STATIC RESPONSE
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Static server running on ${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
