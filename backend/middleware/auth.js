const jwt = require('jsonwebtoken');

// Import MongoDB models with error handling
let models;
try {
  const { getModels } = require('../models/mongodb');
  models = getModels;
} catch (error) {
  console.warn('⚠️ MongoDB models not available:', error.message);
  models = null;
}

// Mock user data for when database is not available
const mockUser = {
  id: 'mock_user_123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  isVerified: true
};

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Find user (skip if models not available)
    if (!models) {
      console.warn('⚠️ Database models not available, skipping user lookup');
      req.user = { id: decoded.userId, isActive: true }; // Mock user for testing
      return next();
    }

    const user = await models.User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = authMiddleware;
