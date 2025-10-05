const express = require('express');
const { getModels } = require('../models/mongodb');
const router = express.Router();

// Get MongoDB models
let User, Transaction;

// Initialize models
const initModels = async () => {
  if (!User || !Transaction) {
    const models = await getModels();
    User = models.User;
    Transaction = models.Transaction;
  }
};

// Create transaction
router.post('/', async (req, res) => {
  try {
    await initModels();
    
    const { fromUserId, toUserId, amount, description, type = 'transfer' } = req.body;
    
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'fromUserId, toUserId, and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if sender has sufficient balance
    const senderResult = await User.findById(fromUserId);
    if (!senderResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    if (senderResult.user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create transaction
    const result = await Transaction.create({
      fromUserId,
      toUserId,
      amount,
      description,
      type,
      currency: 'USD',
      status: 'pending'
    });

    if (result.success) {
      // Update balances
      await User.updateBalance(fromUserId, -amount);
      await User.updateBalance(toUserId, amount);
      
      // Update transaction status
      await Transaction.updateStatus(result.transaction.id, 'completed');

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        transaction: {
          id: result.transaction.id,
          transactionId: result.transaction.transactionId,
          fromUserId: result.transaction.fromUserId,
          toUserId: result.transaction.toUserId,
          amount: result.transaction.amount,
          description: result.transaction.description,
          type: result.transaction.type,
          status: 'completed',
          createdAt: result.transaction.createdAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    await initModels();
    
    const { id } = req.params;
    const result = await Transaction.findById(id);

    if (result.success) {
      res.json({
        success: true,
        transaction: {
          id: result.transaction.id,
          transactionId: result.transaction.transactionId,
          fromUserId: result.transaction.fromUserId,
          toUserId: result.transaction.toUserId,
          amount: result.transaction.amount,
          description: result.transaction.description,
          type: result.transaction.type,
          status: result.transaction.status,
          createdAt: result.transaction.createdAt,
          updatedAt: result.transaction.updatedAt
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transactions by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    await initModels();
    
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Transaction.findByUserId(userId, page, limit);

    if (result.success) {
      res.json({
        success: true,
        transactions: result.transactions.map(tx => ({
          id: tx.id,
          transactionId: tx.transactionId,
          fromUserId: tx.fromUserId,
          toUserId: tx.toUserId,
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
          status: tx.status,
          createdAt: tx.createdAt
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
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    await initModels();
    
    const { userId } = req.params;
    const period = req.query.period || '30d';

    const result = await Transaction.getStats(userId, period);

    if (result.success) {
      res.json({
        success: true,
        stats: result.stats,
        period
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get recent transactions
router.get('/recent/:userId', async (req, res) => {
  try {
    await initModels();
    
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Transaction.getRecent(userId, limit);

    if (result.success) {
      res.json({
        success: true,
        transactions: result.transactions.map(tx => ({
          id: tx.id,
          transactionId: tx.transactionId,
          fromUserId: tx.fromUserId,
          toUserId: tx.toUserId,
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
          status: tx.status,
          createdAt: tx.createdAt
        }))
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
