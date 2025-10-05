const express = require('express');
const { connectMongoDB, getCollection } = require('../config/mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, name, and password are required' 
      });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    const usersCollection = getCollection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = {
      email,
      name,
      password: hashedPassword,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // Remove password from response
    const userResponse = {
      _id: result.insertedId,
      email: newUser.email,
      name: newUser.name,
      balance: newUser.balance,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Connect to MongoDB
    await connectMongoDB();
    const usersCollection = getCollection('users');
    
    // Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    const usersCollection = getCollection('users');
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    
    // Remove passwords from response
    const usersResponse = users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json({
      success: true,
      users: usersResponse
    });
    
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
