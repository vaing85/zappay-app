const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Fee calculation service
const calculateFee = (amount, planType = 'basic') => {
  const feeRates = {
    'free': 0.029,      // 2.9%
    'starter': 0.025,   // 2.5%
    'basic': 0.022,     // 2.2%
    'pro': 0.019,       // 1.9%
    'business': 0.016,  // 1.6%
    'enterprise': 0.013 // 1.3%
  };
  
  const rate = feeRates[planType] || feeRates['basic'];
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
};

// Payment validation service
const validatePaymentData = (paymentData) => {
  const errors = [];
  
  // Validate amount
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (paymentData.amount > 100000) {
    errors.push('Amount cannot exceed $100,000');
  }
  
  // Validate currency
  const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  if (!paymentData.currency || !supportedCurrencies.includes(paymentData.currency.toLowerCase())) {
    errors.push('Currency must be one of: ' + supportedCurrencies.join(', '));
  }
  
  // Validate payment method
  if (!paymentData.payment_method) {
    errors.push('Payment method is required');
  } else {
    const { type, card } = paymentData.payment_method;
    
    if (type === 'card') {
      if (!card) {
        errors.push('Card details are required for card payments');
      } else {
        // Basic card validation
        if (!card.number || card.number.length < 13) {
          errors.push('Invalid card number');
        }
        
        if (!card.exp_month || card.exp_month < 1 || card.exp_month > 12) {
          errors.push('Invalid expiration month');
        }
        
        if (!card.exp_year || card.exp_year < new Date().getFullYear()) {
          errors.push('Invalid expiration year');
        }
        
        if (!card.cvc || card.cvc.length < 3) {
          errors.push('Invalid CVC');
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calculate payment fee
 * POST /api/payments/calculate-fee
 */
router.post('/calculate-fee', [
  body('amount').isFloat({ min: 0.01, max: 100000 }).withMessage('Amount must be between $0.01 and $100,000'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp', 'cad', 'aud']).withMessage('Invalid currency'),
  body('plan_type').optional().isIn(['free', 'starter', 'basic', 'pro', 'business', 'enterprise']).withMessage('Invalid plan type')
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

    const { amount, currency = 'usd', plan_type = 'basic' } = req.body;
    
    const fee = calculateFee(amount, plan_type);
    const total = amount + fee;
    const feeRate = (fee / amount * 100).toFixed(2);
    
    res.json({
      success: true,
      fee: fee,
      amount: amount,
      total: total,
      currency: currency,
      plan_type: plan_type,
      fee_rate: parseFloat(feeRate),
      breakdown: {
        amount: amount,
        fee: fee,
        total: total
      }
    });
    
  } catch (error) {
    console.error('Fee calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fee',
      error: error.message
    });
  }
});

/**
 * Validate payment data
 * POST /api/payments/validate
 */
router.post('/validate', [
  body('amount').isFloat({ min: 0.01, max: 100000 }).withMessage('Amount must be between $0.01 and $100,000'),
  body('currency').isIn(['usd', 'eur', 'gbp', 'cad', 'aud']).withMessage('Invalid currency'),
  body('payment_method').isObject().withMessage('Payment method is required')
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

    const paymentData = req.body;
    const validation = validatePaymentData(paymentData);
    
    if (validation.valid) {
      // Calculate fee for valid payment
      const fee = calculateFee(paymentData.amount, paymentData.plan_type || 'basic');
      
      res.json({
        success: true,
        message: 'Payment data is valid',
        validation: {
          valid: true,
          amount: paymentData.amount,
          currency: paymentData.currency,
          fee: fee,
          total: paymentData.amount + fee
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment data validation failed',
        validation: {
          valid: false,
          errors: validation.errors
        }
      });
    }
    
  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate payment',
      error: error.message
    });
  }
});

/**
 * Get fee rates for all plans
 * GET /api/payments/fee-rates
 */
router.get('/fee-rates', async (req, res) => {
  try {
    const feeRates = {
      'free': { rate: 0.029, percentage: '2.9%' },
      'starter': { rate: 0.025, percentage: '2.5%' },
      'basic': { rate: 0.022, percentage: '2.2%' },
      'pro': { rate: 0.019, percentage: '1.9%' },
      'business': { rate: 0.016, percentage: '1.6%' },
      'enterprise': { rate: 0.013, percentage: '1.3%' }
    };
    
    res.json({
      success: true,
      fee_rates: feeRates,
      currency: 'usd',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Fee rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee rates',
      error: error.message
    });
  }
});

module.exports = router;
