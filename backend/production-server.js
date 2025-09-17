const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting ZapPay Production Server...');
console.log('Port:', PORT);
console.log('Host:', HOST);
console.log('Environment:', process.env.NODE_ENV || 'production');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://sandboxapi.rapyd.net", "https://api.rapyd.net"],
      frameSrc: ["'self'", "https://sandboxapi.rapyd.net", "https://api.rapyd.net"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// TEMPORARILY DISABLE CORS FOR DEBUGGING - MANUAL HEADERS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    serverFile: 'production-server.js',
    corsStatus: 'MANUAL_HEADERS_APPLIED'
  });
});

// Test endpoint to verify which server file is running
app.get('/test-production', (req, res) => {
  res.json({
    message: 'Production server test endpoint',
    serverFile: 'production-server.js',
    corsStatus: 'MANUAL_HEADERS_APPLIED',
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      database: 'checking...',
      redis: 'checking...',
      payments: 'checking...'
    }
  });
});

// Basic API endpoints
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'ZapPay API is working!',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'ZapPay Production Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 ZapPay Production Server running on ${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📊 API status: http://${HOST}:${PORT}/api/status`);
  console.log(`✅ Server started successfully!`);
});
