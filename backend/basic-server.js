const http = require('http');
const { Sequelize } = require('sequelize');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('Starting enhanced basic server v4 with database...');
console.log('Port:', PORT);
console.log('Host:', HOST);

// Database connection
let sequelize;
let dbConnected = false;

async function connectDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    
    sequelize = new Sequelize(process.env.DB_URL || process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false, // Disable SQL logging in production
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    dbConnected = true;
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Continuing without database...');
    dbConnected = false;
    return null;
  }
}

// Initialize database connection
connectDatabase();

const server = http.createServer((req, res) => {
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
    const dbStatus = dbConnected ? 'connected' : 'disconnected';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '4.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: dbStatus,
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
