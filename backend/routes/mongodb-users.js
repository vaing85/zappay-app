const express = require('express');
const { connectMongoDB, getCollection } = require('../config/mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    await initModels();
    
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and password are required'
      });
    }

    const result = await User.create({
      email: email.toLowerCase(),
      name,
      password, // In production, hash this password
      balance: 0
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          balance: result.user.balance,
          createdAt: result.user.createdAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    await initModels();
    
    const { id } = req.params;
    const result = await User.findById(id);

    if (result.success) {
      res.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          balance: result.user.balance,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    await initModels();
    
    const { email } = req.params;
    const result = await User.findByEmail(email);

    if (result.success) {
      res.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          balance: result.user.balance,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user balance
router.patch('/:id/balance', async (req, res) => {
  try {
    await initModels();
    
    const { id } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number'
      });
    }

    const result = await User.updateBalance(id, amount);

    if (result.success) {
      res.json({
        success: true,
        message: 'Balance updated successfully',
        modifiedCount: result.modifiedCount
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users (with pagination)
router.get('/', async (req, res) => {
  try {
    await initModels();
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await User.findAll(page, limit);

    if (result.success) {
      res.json({
        success: true,
        users: result.users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          balance: user.balance,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        })),
        pagination: result.pagination
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
