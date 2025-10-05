const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SSNValidation = require('../utils/ssnValidation');

const router = express.Router();

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

    // Try to use real database first
    try {
      const { getModels } = require('../models/mongodb');
      const { User } = await getModels();
      
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
        ssn: ssn ? SSNValidation.maskSSN(ssn) : null,
        balance: 0.00,
        isActive: true,
        createdAt: new Date()
      };

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
      const { getModels } = require('../models/mongodb');
      const { User } = await getModels();
      
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
      if (email === 'test@example.com' && password === 'password123') {
        const mockUser = {
          id: 'test-user-123',
          email: email,
          firstName: 'Test',
          lastName: 'User',
          balance: 1000.00,
          isActive: true
        };

        const token = generateToken(mockUser.id);
        const refreshToken = generateRefreshToken(mockUser.id);

        res.json({
          success: true,
          message: 'Login successful (mock mode)',
          data: {
            user: mockUser,
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
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Generate new tokens
    const newToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
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

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Try to use real database first
    try {
      const { getModels } = require('../models/mongodb');
      const { User } = await getModels();
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Update verification status
      await user.update({
        emailVerifiedAt: new Date(),
        verificationStatus: {
          ...user.verificationStatus,
          email: true
        }
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (dbError) {
      console.warn('Database not available for email verification:', dbError.message);
      
      // Fallback: just verify the token is valid
      res.json({
        success: true,
        message: 'Email verified successfully (mock mode)'
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const { email } = req.body;

    // Try to use real database first
    try {
      const { getModels } = require('../models/mongodb');
      const { User } = await getModels();
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, a verification email has been sent'
        });
      }

      // Check if already verified
      if (user.emailVerifiedAt) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const token = generateToken(user.id);

      // Send verification email
      try {
        const { sendVerificationEmail } = require('../services/emailService');
        await sendVerificationEmail(user.email, user.firstName, token);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent'
      });
    } catch (dbError) {
      console.warn('Database not available for resend verification:', dbError.message);
      
      // Fallback: just return success
      res.json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;