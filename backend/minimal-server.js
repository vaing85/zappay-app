#!/usr/bin/env node

/**
 * Minimal Server for Testing
 * Simplest possible server to test DigitalOcean deployment
 */

const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    port: process.env.PORT || 'unknown',
    message: 'Minimal server is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ZapPay API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || process.env.DO_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting Minimal Server...');
console.log(`   Port: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

app.listen(PORT, HOST, () => {
  console.log(`✅ Minimal server running on ${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
