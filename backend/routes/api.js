const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateAPIKey } = require('../middleware/apiAuth');

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'ZapPay API Documentation',
    version: '1.0.0',
    baseUrl: process.env.API_BASE_URL || 'https://api.zappay.site/v1',
    endpoints: {
      authentication: {
        'POST /auth/login': 'Authenticate user and get access token',
        'POST /auth/register': 'Register a new user account',
        'POST /auth/refresh': 'Refresh access token'
      },
      payments: {
        'POST /payments/create': 'Create a new payment',
        'GET /payments/{id}': 'Get payment details',
        'GET /payments': 'List user payments',
        'POST /payments/{id}/cancel': 'Cancel a payment'
      },
      transactions: {
        'GET /transactions': 'Get transaction history',
        'GET /transactions/{id}': 'Get transaction details'
      },
      webhooks: {
        'POST /webhooks': 'Create webhook endpoint',
        'GET /webhooks': 'List webhook endpoints',
        'DELETE /webhooks/{id}': 'Delete webhook endpoint'
      }
    }
  });
});

// Authentication endpoints
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if database is available
    let User;
    try {
      const models = require('../models');
      User = models.User;
    } catch (error) {
      console.error('Database models not available:', error);
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    await user.update({ lastLoginAt: new Date() });
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        isActive: user.isActive
      },
      expiresIn: 3600 * 24 * 7 // 7 days
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if database is available
    let User;
    try {
      const models = require('../models');
      User = models.User;
    } catch (error) {
      console.error('Database models not available:', error);
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber: req.body.phoneNumber || '',
      balance: 0.00,
      isActive: true
    });
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Payment endpoints (require API key authentication)
router.post('/payments/create', authenticateAPIKey, async (req, res) => {
  try {
    const { amount, currency, recipient, description } = req.body;

    if (!amount || !currency || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Amount, currency, and recipient are required'
      });
    }

    // Mock payment creation
    const paymentId = 'pay_' + Date.now();
    
    res.status(201).json({
      success: true,
      payment: {
        id: paymentId,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        recipient,
        description: description || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/payments/:id', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock payment retrieval
    res.json({
      success: true,
      payment: {
        id,
        amount: 100.00,
        currency: 'USD',
        recipient: 'recipient@example.com',
        description: 'Payment for services',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:31:00Z'
      }
    });
  } catch (error) {
    console.error('Payment retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/payments', authenticateAPIKey, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Mock payments list
    const payments = Array.from({ length: parseInt(limit) }, (_, i) => ({
      id: `pay_${Date.now()}_${i}`,
      amount: Math.random() * 1000,
      currency: 'USD',
      recipient: `recipient${i}@example.com`,
      description: `Payment ${i + 1}`,
      status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    }));

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 100,
        pages: Math.ceil(100 / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Payments list error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Transaction endpoints
router.get('/transactions', authenticateAPIKey, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Mock transactions list
    const transactions = Array.from({ length: parseInt(limit) }, (_, i) => ({
      id: `txn_${Date.now()}_${i}`,
      amount: Math.random() * 500,
      type: ['send', 'receive', 'withdrawal', 'deposit'][Math.floor(Math.random() * 4)],
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      description: `Transaction ${i + 1}`,
      createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString()
    }));

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 200,
        pages: Math.ceil(200 / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Transactions list error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/transactions/:id', authenticateAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock transaction retrieval
    res.json({
      success: true,
      transaction: {
        id,
        amount: 150.00,
        type: 'send',
        status: 'completed',
        description: 'Payment to John Doe',
        recipient: 'john@example.com',
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:31:00Z'
      }
    });
  } catch (error) {
    console.error('Transaction retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoints
router.post('/webhooks', authenticateAPIKey, async (req, res) => {
  try {
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'URL and events array are required'
      });
    }

    // Mock webhook creation
    const webhookId = 'wh_' + Date.now();
    
    res.status(201).json({
      success: true,
      webhook: {
        id: webhookId,
        url,
        events,
        secret: 'whsec_' + Math.random().toString(36).substring(2, 15),
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Webhook creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/webhooks', authenticateAPIKey, async (req, res) => {
  try {
    // Mock webhooks list
    const webhooks = [
      {
        id: 'wh_123456789',
        url: 'https://example.com/webhooks/zappay',
        events: ['payment.completed', 'payment.failed'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-15T10:30:00Z'
      }
    ];

    res.json({
      success: true,
      webhooks
    });
  } catch (error) {
    console.error('Webhooks list error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ZapPay API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
