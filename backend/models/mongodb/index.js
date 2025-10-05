const { connectMongoDB, getCollection } = require('../../config/mongodb');

// Import MongoDB models
const User = require('./User');
const Transaction = require('./Transaction');

let userModel, transactionModel;

// Initialize MongoDB models
const initializeModels = async () => {
  try {
    const { db } = await connectMongoDB();
    
    // Initialize models with collections
    userModel = new User(getCollection('users'));
    transactionModel = new Transaction(getCollection('transactions'));
    
    console.log('✅ MongoDB models initialized successfully');
    
    return {
      User: userModel,
      Transaction: transactionModel
    };
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB models:', error.message);
    throw error;
  }
};

// Get models (initialize if not already done)
const getModels = async () => {
  if (!userModel || !transactionModel) {
    return await initializeModels();
  }
  
  return {
    User: userModel,
    Transaction: transactionModel
  };
};

module.exports = {
  initializeModels,
  getModels,
  User,
  Transaction
};
