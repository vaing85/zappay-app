const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SSNValidation = require('../utils/ssnValidation');

const router = express.Router();

// In-memory user store for mock authentication
const mockUsers = new Map();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (with database fallback)
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phoneNumber').isLength({ min: 10, max: 20 }).withMessage('Please provide a valid phone number'),
  body('ssn').optional().custom((value) => {
    if (value) {
      const validation = SSNValidation.validateSSN(value);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phoneNumber, ssn } = req.body;

    // Check if user already exists in mock store
    if (mockUsers.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Try to use real database first
    try {
      const { User } = require('../models');
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        ssn: ssn ? SSNValidation.cleanSSN(ssn) : null
      });

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });
    } catch (dbError) {
      console.warn('Database not available, using mock registration:', dbError.message);
      
      // Fallback to mock registration
      const mockUser = {
        id: 'user-' + Date.now(),
        firstName,
        lastName,
        email,
        phoneNumber,
        password, // Store password for login validation
        ssn: ssn ? SSNValidation.maskSSN(ssn) : null,
        balance: 0.00,
        isActive: true,
        createdAt: new Date()
      };

      // Store user in mock store
      mockUsers.set(email, mockUser);

      const token = generateToken(mockUser.id);
      const refreshToken = generateRefreshToken(mockUser.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully (mock mode)',
        data: {
          user: mockUser,
          token,
          refreshToken
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (with database fallback)
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Try to use real database first
    try {
      const { User } = require('../models');
      
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });
    } catch (dbError) {
      console.warn('Database not available, using mock login:', dbError.message);
      
      // Fallback to mock authentication
      const mockUser = mockUsers.get(email);
      
      if (mockUser && mockUser.password === password && mockUser.isActive) {
        const token = generateToken(mockUser.id);
        const refreshToken = generateRefreshToken(mockUser.id);

        res.json({
          success: true,
          message: 'Login successful (mock mode)',
          data: {
            user: {
              id: mockUser.id,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              email: mockUser.email,
              phoneNumber: mockUser.phoneNumber,
              balance: mockUser.balance,
              isActive: mockUser.isActive,
              createdAt: mockUser.createdAt
            },
            token,
            refreshToken
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = generateToken(decoded.userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Public
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: decoded.userId
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
