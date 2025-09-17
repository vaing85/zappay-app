const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const conditionalAuth = require('./middleware/conditionalAuth');
const logger = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userManagementRoutes = require('./routes/userManagement');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const groupRoutes = require('./routes/groups');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');
const webhookRoutes = require('./routes/webhooks');

const app = express();

// Trust proxy for DigitalOcean App Platform
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration - TEMPORARILY ALLOW ALL ORIGINS FOR DEBUGGING
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS check - Origin: "${origin}"`);
    console.log(`🔍 CORS check - Environment CORS_ORIGIN: "${process.env.CORS_ORIGIN}"`);
    
    // TEMPORARILY ALLOW ALL ORIGINS FOR DEBUGGING
    console.log(`✅ CORS temporarily allowing all origins for debugging`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// TEMPORARILY DISABLE CORS FOR DEBUGGING
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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: process.env.REDIS_URL ? 'configured' : 'disabled',
      rapyd: process.env.RAPYD_ACCESS_KEY ? 'configured' : 'disabled',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'disabled',
      email: process.env.SENDGRID_API_KEY ? 'configured' : 'disabled',
      sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'disabled'
    }
  };

  try {
    // Try to test database connection
    const { sequelize } = require('./config/database');
    sequelize.authenticate()
      .then(() => {
        healthCheck.services.database = 'connected';
        res.status(200).json(healthCheck);
      })
      .catch((err) => {
        healthCheck.services.database = 'error';
        healthCheck.error = err.message;
        res.status(503).json(healthCheck);
      });
  } catch (error) {
    healthCheck.services.database = 'error';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// Test endpoint to verify CORS headers
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test endpoint',
    origin: req.headers.origin,
    serverFile: 'server-production.js',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/payments', conditionalAuth, paymentRoutes);
app.use('/api', webhookRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || process.env.DO_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 ZapPay API Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
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
