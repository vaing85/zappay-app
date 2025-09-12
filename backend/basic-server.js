const http = require('http');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('Starting enhanced basic server v3...');
console.log('Port:', PORT);
console.log('Host:', HOST);

const server = http.createServer(async (req, res) => {
  console.log('Request received:', req.method, req.url);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: 'not_implemented',
        redis: 'not_implemented',
        payments: 'not_implemented'
      }
    }));
    return;
  }
  
  if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ZapPay API v4 is working!',
      timestamp: new Date().toISOString(),
      version: '4.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: dbConnected ? 'connected' : 'disconnected'
    }));
    return;
  }
  
  if (req.url === '/api/db-test') {
    if (!dbConnected) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Database not connected',
        message: 'Database connection is not available'
      }));
      return;
    }
    
    try {
      // Test database query
      const result = await sequelize.query('SELECT NOW() as current_time', {
        type: Sequelize.QueryTypes.SELECT
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Database test successful!',
        timestamp: new Date().toISOString(),
        database_time: result[0].current_time,
        version: '4.0.0'
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Database query failed',
        message: error.message
      }));
    }
    return;
  }
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ZapPay Production Server v4 is running!',
      timestamp: new Date().toISOString(),
      version: '4.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: dbConnected ? 'connected' : 'disconnected',
      endpoints: {
        health: '/health',
        status: '/api/status',
        test: '/api/test',
        dbTest: '/api/db-test'
      }
    }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 ZapPay Production Server v4 running on ${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📊 API status: http://${HOST}:${PORT}/api/status`);
  console.log(`🧪 API test: http://${HOST}:${PORT}/api/test`);
  console.log(`🗄️  Database test: http://${HOST}:${PORT}/api/db-test`);
  console.log(`✅ Server started successfully!`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (sequelize) {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (sequelize) {
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});
