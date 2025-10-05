const express = require('express');
const router = express.Router();
const logger = require('../middleware/logger');
const feeService = require('../services/feeService');
const { generalLimiter } = require('../middleware/rateLimiting');

/**
 * Get fee structure information
 * GET /api/fees/structure
 */
router.get('/structure', generalLimiter, async (req, res) => {
  try {
    const result = feeService.getFeeStructure();
    
    res.json({
      success: true,
      message: 'Fee structure retrieved successfully',
      data: result
    });
    
  } catch (error) {
    logger.error('Fee structure retrieval error', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee structure',
      error: error.message
    });
  }
});

/**
 * Calculate fee for a transaction
 * POST /api/fees/calculate
 */
router.post('/calculate', generalLimiter, async (req, res) => {
  try {
    const { amount, paymentType = 'card', isInternal = false } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    let result;
    if (isInternal) {
      result = feeService.calculateInternalFee(amount);
    } else {
      result = feeService.calculateExternalFee(amount, paymentType);
    }
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Fee calculated successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
  } catch (error) {
    logger.error('Fee calculation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fee',
      error: error.message
    });
  }
});

/**
 * Calculate revenue projection
 * POST /api/fees/revenue-projection
 */
router.post('/revenue-projection', generalLimiter, async (req, res) => {
  try {
    const { 
      userCount, 
      userDistribution = {
        free: 60,
        starter: 20,
        basic: 15,
        pro: 4,
        business: 0.8,
        enterprise: 0.2
      },
      transactionStats = {
        averageTransactionsPerUser: 20,
        averageTransactionAmount: 75,
        externalTransactionPercentage: 30
      }
    } = req.body;
    
    if (!userCount || userCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid user count is required'
      });
    }
    
    const result = feeService.calculateRevenueProjection(
      userCount, 
      userDistribution, 
      transactionStats
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Revenue projection calculated successfully',
        data: result.projection
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
  } catch (error) {
    logger.error('Revenue projection calculation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue projection',
      error: error.message
    });
  }
});

/**
 * Get fee examples for different amounts
 * GET /api/fees/examples
 */
router.get('/examples', generalLimiter, async (req, res) => {
  try {
    const examples = [
      { amount: 10, paymentType: 'card', isInternal: false },
      { amount: 25, paymentType: 'bank', isInternal: false },
      { amount: 50, paymentType: 'card', isInternal: false },
      { amount: 100, paymentType: 'instant', isInternal: false },
      { amount: 250, paymentType: 'international', isInternal: false },
      { amount: 10, isInternal: true },
      { amount: 50, isInternal: true },
      { amount: 100, isInternal: true }
    ];
    
    const results = examples.map(example => {
      let result;
      if (example.isInternal) {
        result = feeService.calculateInternalFee(example.amount);
      } else {
        result = feeService.calculateExternalFee(example.amount, example.paymentType);
      }
      
      return {
        example: example,
        calculation: result
      };
    });
    
    res.json({
      success: true,
      message: 'Fee examples retrieved successfully',
      data: {
        examples: results,
        note: 'Internal transfers are always free. External payments have fees based on payment type.'
      }
    });
    
  } catch (error) {
    logger.error('Fee examples retrieval error', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee examples',
      error: error.message
    });
  }
});

module.exports = router;
