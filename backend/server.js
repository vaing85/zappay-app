const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { 
  generalLimiter, 
  authLimiter, 
  paymentLimiter, 
  webhookLimiter, 
  passwordResetLimiter, 
  adminLimiter 
} = require('./middleware/rateLimiting');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth-fixed');
const userRoutes = require('./routes/users');
const userManagementRoutes = require('./routes/userManagement');
const transactionRoutes = require('./routes/transactions');
const webhookRoutes = require('./routes/webhooks');
const groupRoutes = require('./routes/groups');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');
const apiRoutes = require('./routes/api');
const stripePaymentRoutes = require('./routes/stripe-payments');
const stripeWebhookRoutes = require('./routes/stripe-webhooks');
const stripeSubscriptionRoutes = require('./routes/stripe-subscriptions');
const complianceRoutes = require('./routes/compliance');
const paymentValidationRoutes = require('./routes/payment-validation');

// Import MongoDB routes
const mongoUserRoutes = require('./routes/mongodb-users-simple');
const mongoTransactionRoutes = require('./routes/mongodb-transactions');
const feeRoutes = require('./routes/fees');
const { transactionLimitsMiddleware } = require('./middleware/transactionLimits');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const conditionalAuth = require('./middleware/conditionalAuth');
const logger = require('./middleware/logger');
const { performanceMonitor, healthCheck, errorTracker } = require('./middleware/monitoring');
const productionSecurity = require('./middleware/productionSecurity');

// Import scheduler for daily reports
const SchedulerService = require('./services/scheduler');
const { 
  performanceMonitor: prodPerformanceMonitor, 
  errorTracker: prodErrorTracker, 
  healthCheck: prodHealthCheck,
  metrics,
  requestLogger: prodRequestLogger,
  securityLogger
} = require('./middleware/productionMonitoring');

// Import MongoDB Atlas connection
let connectMongoDB;
try {
  const { connectMongoDB: mongoConnect } = require('./config/mongodb');
  connectMongoDB = mongoConnect;
} catch (error) {
  console.warn('⚠️ MongoDB config not available:', error.message);
  connectMongoDB = async () => {
    console.warn('⚠️ MongoDB connection skipped');
    return null;
  };
}

try {
  const redisConfig = require('./config/redis');
  connectRedis = redisConfig.connectRedis;
} catch (error) {
  console.warn('⚠️ Redis config not available:', error.message);
  connectRedis = async () => {
    console.warn('⚠️ Redis connection skipped');
    return null;
  };
}

const app = express();

// Trust proxy for DigitalOcean App Platform
app.set('trust proxy', 1);

// Apply production security middleware
if (process.env.NODE_ENV === 'production') {
  productionSecurity(app);
}

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      "http://localhost:3000",
      "https://zappay.site",
      "https://zappayapp.netlify.app",
      "https://zappay-app-frontend.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With", 
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma"
    ],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// CORS configuration - TEMPORARILY ALLOW ALL ORIGINS FOR DEBUGGING
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS check - Origin: "${origin}"`);
    console.log(`🔍 CORS check - Environment CORS_ORIGIN: "${process.env.CORS_ORIGIN}"`);
    console.log(`🔍 CORS check - Environment ALLOWED_ORIGINS: "${process.env.ALLOWED_ORIGINS}"`);
    
    // TEMPORARILY ALLOW ALL ORIGINS FOR DEBUGGING
    console.log(`✅ CORS temporarily allowing all origins for debugging`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Date',
    'If-Modified-Since',
    'If-None-Match',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Date',
    'Server',
    'X-Request-ID'
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

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

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(prodRequestLogger);
  app.use(prodPerformanceMonitor);
} else {
  app.use(morgan('dev'));
  app.use(logger.requestLogger);
  app.use(performanceMonitor);
}

// Health check endpoint
app.get('/health', process.env.NODE_ENV === 'production' ? prodHealthCheck : healthCheck);

// Debug endpoint for CORS troubleshooting
app.get('/debug/cors', (req, res) => {
  const debugData = {
    corsOrigin: process.env.CORS_ORIGIN,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    requestOrigin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    serverFile: 'server.js',
    timestamp: new Date().toISOString()
  };
  
  res.json(debugData);
});

// Test endpoint to verify which server file is running
app.get('/test-server', (req, res) => {
  res.json({
    message: 'Server test endpoint',
    serverFile: 'server.js',
    corsStatus: 'MANUAL_HEADERS_APPLIED',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint (production only)
if (process.env.NODE_ENV === 'production') {
  app.get('/metrics', metrics);
}


// Favicon endpoint to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

// Robots.txt endpoint to prevent 404 errors
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Common static asset endpoints to prevent 404 errors
app.get('/manifest.json', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

app.get('/favicon.svg', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

app.get('/logo192.svg', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

app.get('/logo512.svg', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

app.get('/apple-touch-icon.png', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});

app.get('/sw.js', (req, res) => {
  res.status(204).end(); // No Content - prevents 404 errors
});


// Simple SendGrid test endpoint
app.get('/email-test', async (req, res) => {
  try {
    // Check if SendGrid environment variables are set
    const hasSendGridKey = !!process.env.SENDGRID_API_KEY;
    const hasFromEmail = !!process.env.SENDGRID_FROM_EMAIL;
    
    if (!hasSendGridKey || !hasFromEmail) {
      return res.status(400).json({
        success: false,
        message: 'SendGrid environment variables not set',
        hasApiKey: hasSendGridKey,
        hasFromEmail: hasFromEmail
      });
    }

    const emailService = require('./services/emailService');
    const result = await emailService.sendTestEmail('test@example.com', 'Test User');

    if (result.success) {
      res.json({
        success: true,
        message: 'SendGrid connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `SendGrid connection failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.status(500).json({
      success: false,
      message: 'SendGrid test failed',
      error: error.message
    });
  }
});

// MongoDB Atlas health check endpoint
app.get('/mongodb-health', async (req, res) => {
  try {
    // Test MongoDB connection directly
    const { connectMongoDB, healthCheck } = require('./config/mongodb');
    
    // Connect to MongoDB
    await connectMongoDB();
    const health = await healthCheck();
    
    res.json({
      success: true,
      message: 'MongoDB Atlas connection successful',
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB Atlas health check error:', error);
    res.status(500).json({
      success: false,
      message: 'MongoDB Atlas connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Stripe health check endpoint
app.get('/stripe-health', async (req, res) => {
  try {
    // Check if Stripe environment variables are set
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY;
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!hasSecretKey || !hasPublishableKey) {
      return res.status(400).json({
        success: false,
        message: 'Stripe environment variables not set',
        hasSecretKey,
        hasPublishableKey,
        hasWebhookSecret
      });
    }

    // Test Stripe connection by creating a test payment intent
    const stripePaymentService = require('./services/stripePaymentService');
    const testResult = await stripePaymentService.createPaymentIntent({
      amount: 0.50, // Minimum amount for testing
      currency: 'usd',
      description: 'Stripe health check test'
    });

    if (testResult.success) {
      res.json({
        success: true,
        message: 'Stripe connection successful',
        timestamp: new Date().toISOString(),
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookConfigured: hasWebhookSecret
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Stripe connection failed: ${testResult.error}`,
        details: testResult.details
      });
    }
  } catch (error) {
    console.error('Stripe health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe health check failed',
      error: error.message
    });
  }
});

// Simple Twilio SMS test endpoint
app.post('/sms-test', async (req, res) => {
  try {
    // Check if Twilio environment variables are set
    const hasAccountSid = !!process.env.TWILIO_ACCOUNT_SID;
    const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN;
    const hasPhoneNumber = !!process.env.TWILIO_PHONE_NUMBER;
    
    if (!hasAccountSid || !hasAuthToken || !hasPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Twilio environment variables not set',
        hasAccountSid,
        hasAuthToken,
        hasPhoneNumber
      });
    }

    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required in request body'
      });
    }

    const smsService = require('./services/smsService');
    const result = await smsService.testSMSService(phoneNumber);

    if (result.success) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `SMS sending failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('SMS test error:', error);
    res.status(500).json({
      success: false,
      message: 'SMS test failed',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/transactions', authMiddleware, transactionLimitsMiddleware, transactionRoutes);
app.use('/api', webhookRoutes); // Webhooks don't need auth middleware
app.use('/api/payments/webhook/stripe', stripeWebhookRoutes); // Stripe webhooks
app.use('/api/payments', stripePaymentRoutes); // Stripe payment routes
app.use('/api/payments', paymentValidationRoutes); // Payment validation routes
app.use('/api/subscriptions', stripeSubscriptionRoutes); // Stripe subscription routes
app.use('/api/compliance', complianceRoutes); // Compliance and regulatory routes
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// MongoDB Atlas API routes
app.use('/api/mongo/users', mongoUserRoutes);
app.use('/api/mongo/transactions', mongoTransactionRoutes);
app.use('/api/fees', feeRoutes);

// External API routes for developers
app.use('/api/v1', apiRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
if (process.env.NODE_ENV === 'production') {
  app.use(prodErrorTracker);
} else {
  app.use(errorTracker);
}
app.use(errorHandler);

// Database and Redis connection
const startServer = async () => {
  try {
    console.log('🚀 Starting ZapPay Backend Server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Port: ${process.env.PORT || 3001}`);
    console.log(`🔗 Host: ${process.env.HOST || '0.0.0.0'}`);
    
    // Log environment variables (without sensitive data)
    // Only log environment info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Environment check:');
      console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
      console.log(`  - PORT: ${process.env.PORT || 'not set (using default 3001)'}`);
      console.log(`  - DB_URL: ${process.env.DB_URL ? 'set' : 'not set'}`);
      console.log(`  - REDIS_URL: ${process.env.REDIS_URL ? 'set' : 'not set'}`);
    } else {
      console.log('📝 Environment: Production mode - security logging disabled');
    }
    
    // Try to connect to MongoDB Atlas, but don't fail if it doesn't exist yet
    try {
      await connectMongoDB();
      console.log('✅ MongoDB Atlas connected');
    } catch (dbError) {
      console.warn('⚠️ MongoDB Atlas connection failed (will retry later):', dbError.message);
    }
    
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed (will retry later):', redisError.message);
    }
    
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
      console.log(`🚀 ZapPay Backend Server running on ${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
      console.log('✅ Server started successfully!');
      
      // Start scheduled jobs for daily reports
      const scheduler = new SchedulerService();
      scheduler.startAll();
      console.log('📧 Daily report scheduler started');
    });

    // Handle server errors gracefully
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('📝 Error details:', error.message);
    console.error('📝 Stack trace:', error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };

