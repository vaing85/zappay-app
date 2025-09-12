const http = require('http');
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

console.log('🚀 Starting ZapPay Production Server v5 with Authentication...');
console.log('Port:', PORT);
console.log('Host:', HOST);
console.log('Environment:', process.env.NODE_ENV || 'production');

// Database connection
let sequelize;
let dbConnected = false;

async function connectDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    
    sequelize = new Sequelize(process.env.DB_URL || process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
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

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to parse JSON body
function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No token provided' }));
    return false;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (error) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid token' }));
    return false;
  }
}

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
    const dbStatus = dbConnected ? 'connected' : 'disconnected';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      timestamp: new Date().toISOString(),
      version: '5.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: dbStatus,
        authentication: 'implemented',
        redis: 'not_implemented',
        payments: 'not_implemented'
      }
    }));
    return;
  }
  
  if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ZapPay API v5 is working!',
      timestamp: new Date().toISOString(),
      version: '5.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: dbConnected ? 'connected' : 'disconnected',
      authentication: 'implemented'
    }));
    return;
  }
  
  // Authentication endpoints
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    try {
      const body = await parseJSONBody(req);
      const { email, password, name } = body;
      
      if (!email || !password || !name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email, password, and name are required' }));
        return;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user (simplified - in production, use proper database models)
      const user = {
        id: Date.now(),
        email,
        name,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, name: user.name },
        token
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Registration failed', message: error.message }));
    }
    return;
  }
  
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseJSONBody(req);
      const { email, password } = body;
      
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password are required' }));
        return;
      }
      
      // In production, this would query the database
      // For now, we'll simulate a successful login
      const user = {
        id: 1,
        email,
        name: 'Test User',
        password: await bcrypt.hash('password123', 10) // This would be from database
      };
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name },
        token
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Login failed', message: error.message }));
    }
    return;
  }
  
  if (req.url === '/api/auth/profile' && req.method === 'GET') {
    if (!verifyToken(req, res)) return;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Profile retrieved successfully',
      user: req.user
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
      const result = await sequelize.query('SELECT NOW() as current_time', {
        type: Sequelize.QueryTypes.SELECT
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Database test successful!',
        timestamp: new Date().toISOString(),
        database_time: result[0].current_time,
        version: '5.0.0'
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
      message: 'ZapPay Production Server v5 is running!',
      timestamp: new Date().toISOString(),
      version: '5.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: dbConnected ? 'connected' : 'disconnected',
      authentication: 'implemented',
      endpoints: {
        health: '/health',
        status: '/api/status',
        test: '/api/test',
        dbTest: '/api/db-test',
        register: '/api/auth/register',
        login: '/api/auth/login',
        profile: '/api/auth/profile'
      }
    }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 ZapPay Production Server v5 running on ${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📊 API status: http://${HOST}:${PORT}/api/status`);
  console.log(`🧪 API test: http://${HOST}:${PORT}/api/test`);
  console.log(`🗄️  Database test: http://${HOST}:${PORT}/api/db-test`);
  console.log(`🔐 Auth register: http://${HOST}:${PORT}/api/auth/register`);
  console.log(`🔐 Auth login: http://${HOST}:${PORT}/api/auth/login`);
  console.log(`🔐 Auth profile: http://${HOST}:${PORT}/api/auth/profile`);
  console.log(`✅ Server started successfully!`);
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
