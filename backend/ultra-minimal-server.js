#!/usr/bin/env node

/**
 * Ultra Minimal Server
 * Absolute simplest server possible - no dependencies
 */

const http = require('http');

const PORT = process.env.PORT || process.env.DO_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting Ultra Minimal Server...');
console.log(`   Port: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

const server = http.createServer((req, res) => {
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      port: PORT,
      message: 'Ultra minimal server is running'
    }));
    return;
  }
  
  // Root endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ZapPay API Server',
      status: 'running',
      timestamp: new Date().toISOString(),
      version: 'ultra-minimal'
    }));
    return;
  }
  
  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Ultra minimal server running on ${HOST}:${PORT}`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
