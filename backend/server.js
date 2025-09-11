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
const authRoutes = require('./routes/auth-simple');
const userRoutes = require('./routes/users');
const userManagementRoutes = require('./routes/userManagement');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const groupRoutes = require('./routes/groups');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');
const apiRoutes = require('./routes/api');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const logger = require('./middleware/logger');
const { performanceMonitor, healthCheck, errorTracker } = require('./middleware/monitoring');

// Import database connections with error handling
let connectDB, connectRedis;
try {
  const { connectDB: dbConnect } = require('./models');
  connectDB = dbConnect;
} catch (error) {
  console.warn('⚠️ Database models not available:', error.message);
  connectDB = async () => {
    console.warn('⚠️ Database connection skipped');
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

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      "http://localhost:3000",
      "https://zappay.site",
      "https://zappayapp.netlify.app",
      "https://zappay-app-frontend.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
      connectSrc: ["'self'", "https://sandboxapi.rapyd.net", "https://api.rapyd.net"],
      frameSrc: ["'self'", "https://sandboxapi.rapyd.net", "https://api.rapyd.net"],
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

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    "http://localhost:3000",
    "https://zappay.site",
    "https://zappayapp.netlify.app",
    "https://zappay-app-frontend.netlify.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
  app.use(logger.requestLogger);
  app.use(performanceMonitor);
} else {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', healthCheck);

// Rapyd health check endpoint (public)
app.get('/rapyd-health', async (req, res) => {
  try {
    // Check if Rapyd environment variables are set
    const hasAccessKey = !!process.env.RAPYD_ACCESS_KEY;
    const hasSecretKey = !!process.env.RAPYD_SECRET_KEY;
    const hasBaseUrl = !!process.env.RAPYD_BASE_URL;
    
    if (!hasAccessKey || !hasSecretKey || !hasBaseUrl) {
      return res.status(400).json({
        success: false,
        message: 'Rapyd environment variables not set',
        hasAccessKey,
        hasSecretKey,
        hasBaseUrl
      });
    }

    const rapydService = require('./services/rapydPaymentService');
    const result = await rapydService.getPaymentMethods('US');

    if (result.success) {
      res.json({
        success: true,
        message: 'Rapyd connection successful',
        timestamp: new Date().toISOString(),
        availableMethods: result.paymentMethods?.length || 0,
        status: 'healthy'
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Rapyd connection failed: ${result.error}`,
        status: 'unhealthy'
      });
    }
  } catch (error) {
    console.error('Rapyd health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapyd health check failed',
      error: error.message,
      status: 'error'
    });
  }
});

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

// Simple Stripe test endpoint
app.get('/stripe-test', async (req, res) => {
  try {
    // Check if Stripe environment variables are set
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    const hasStripePubKey = !!process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!hasStripeKey || !hasStripePubKey) {
      return res.status(400).json({
        success: false,
        message: 'Stripe environment variables not set',
        hasSecretKey: hasStripeKey,
        hasPublishableKey: hasStripePubKey
      });
    }

    const stripeService = require('./services/stripePaymentService');
    const result = await stripeService.createPaymentIntent(1, 'usd', { test: true });

    if (result.success) {
      res.json({
        success: true,
        message: 'Stripe connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Stripe connection failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe test failed',
      error: error.message
    });
  }
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
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api', webhookRoutes); // Webhooks don't need auth middleware
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

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

// Public Stripe test endpoint (moved here to avoid 404 handler)
app.post('/api/stripe/test', async (req, res) => {
  try {
    const stripeService = require('./services/stripePaymentService');
    const result = await stripeService.createPaymentIntent(1, 'usd', { test: true });

    if (result.success) {
      res.json({
        success: true,
        message: 'Stripe connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Stripe connection failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe test failed'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorTracker);
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
      console.log(`  - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'set' : 'not set'}`);
    } else {
      console.log('📝 Environment: Production mode - security logging disabled');
    }
    
    // Try to connect to databases, but don't fail if they don't exist yet
    try {
      await connectDB();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.warn('⚠️ Database connection failed (will retry later):', dbError.message);
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

