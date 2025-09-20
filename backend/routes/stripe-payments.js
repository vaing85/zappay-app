const express = require('express');
const router = express.Router();
const stripePaymentService = require('../services/stripePaymentService');
const { paymentLimiter } = require('../middleware/rateLimiting');
const logger = require('../middleware/logger');

// Apply rate limiting to all payment routes
router.use(paymentLimiter);

/**
 * Get supported payment methods
 * GET /api/payments/methods
 */
router.get('/methods', async (req, res) => {
  try {
    const paymentMethods = stripePaymentService.getSupportedPaymentMethods();
    
    res.json({
      success: true,
      paymentMethods,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Payment methods error', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
});

/**
 * Get supported currencies
 * GET /api/payments/currencies
 */
router.get('/currencies', async (req, res) => {
  try {
    const currencies = stripePaymentService.getSupportedCurrencies();
    
    res.json({
      success: true,
      currencies,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Currencies error', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve currencies',
      error: error.message
    });
  }
});

/**
 * Create a customer
 * POST /api/payments/customers
 */
router.post('/customers', async (req, res) => {
  try {
    const { email, name, phone, metadata } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await stripePaymentService.createCustomer({
      email,
      name,
      phone,
      metadata
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        customer: result.customer,
        message: 'Customer created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Customer creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
});

/**
 * Create a payment method
 * POST /api/payments/payment-methods
 * NOTE: This endpoint should only be used with Stripe Elements tokenized data
 */
router.post('/payment-methods', async (req, res) => {
  try {
    const { type, card, billingDetails } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Payment method type is required'
      });
    }
    
    // PCI Compliance: Only accept tokenized card data from Stripe Elements
    if (type === 'card' && card && typeof card === 'object' && !card.id) {
      return res.status(400).json({
        success: false,
        message: 'Raw card data not allowed. Use Stripe Elements for card tokenization.'
      });
    }
    
    const result = await stripePaymentService.createPaymentMethod({
      type,
      card,
      billingDetails
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        paymentMethod: result.paymentMethod,
        message: 'Payment method created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment method creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method',
      error: error.message
    });
  }
});

/**
 * Create a payment intent
 * POST /api/payments/intents
 */
router.post('/intents', async (req, res) => {
  try {
    const {
      amount,
      currency = 'usd',
      customerId,
      description,
      metadata,
      paymentMethodId,
      confirm = false
    } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const result = await stripePaymentService.createPaymentIntent({
      amount,
      currency,
      customerId,
      description,
      metadata,
      paymentMethodId,
      confirm
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        paymentIntent: result.paymentIntent,
        message: 'Payment intent created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment intent creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

/**
 * Confirm a payment intent
 * POST /api/payments/intents/:id/confirm
 */
router.post('/intents/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }
    
    const result = await stripePaymentService.confirmPaymentIntent(id, paymentMethodId);
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent,
        message: 'Payment intent confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment intent confirmation error', {
      error: error.message,
      paymentIntentId: req.params.id,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment intent',
      error: error.message
    });
  }
});

/**
 * Get payment intent details
 * GET /api/payments/intents/:id
 */
router.get('/intents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await stripePaymentService.getPaymentIntent(id);
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment intent retrieval error', {
      error: error.message,
      paymentIntentId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment intent',
      error: error.message
    });
  }
});

/**
 * Cancel a payment intent
 * POST /api/payments/intents/:id/cancel
 */
router.post('/intents/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await stripePaymentService.cancelPaymentIntent(id);
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent,
        message: 'Payment intent cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment intent cancellation error', {
      error: error.message,
      paymentIntentId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payment intent',
      error: error.message
    });
  }
});

/**
 * Create a refund
 * POST /api/payments/refunds
 */
router.post('/refunds', async (req, res) => {
  try {
    const {
      paymentIntentId,
      amount,
      reason = 'requested_by_customer',
      metadata
    } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }
    
    const result = await stripePaymentService.createRefund({
      paymentIntentId,
      amount,
      reason,
      metadata
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        refund: result.refund,
        message: 'Refund created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Refund creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create refund',
      error: error.message
    });
  }
});

/**
 * List payment intents for a customer
 * GET /api/payments/intents?customerId=xxx
 */
router.get('/intents', async (req, res) => {
  try {
    const { customerId, limit = 10, startingAfter, endingBefore } = req.query;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }
    
    const result = await stripePaymentService.listPaymentIntents(customerId, {
      limit: parseInt(limit),
      startingAfter,
      endingBefore
    });
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntents: result.paymentIntents,
        hasMore: result.hasMore
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Payment intents listing error', {
      error: error.message,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to list payment intents',
      error: error.message
    });
  }
});

/**
 * Health check for payment endpoints
 * GET /api/payments/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stripe payment endpoints are healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /methods',
      'GET /currencies',
      'POST /customers',
      'POST /payment-methods',
      'POST /intents',
      'POST /intents/:id/confirm',
      'GET /intents/:id',
      'POST /intents/:id/cancel',
      'POST /refunds',
      'GET /intents'
    ]
  });
});

module.exports = router;
