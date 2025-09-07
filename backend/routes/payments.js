const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripePaymentService');

// POST /api/payments/create-intent - Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const result = await stripeService.createPaymentIntent(amount, currency, metadata);

    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/payments/intent/:id - Retrieve payment intent
router.get('/intent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await stripeService.retrievePaymentIntent(id);

    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Payment intent retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/create-customer - Create Stripe customer
router.post('/create-customer', async (req, res) => {
  try {
    const { email, name, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await stripeService.createCustomer(email, name, metadata);

    if (result.success) {
      res.json({
        success: true,
        customer: result.customer
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/setup-intent - Create setup intent for saving payment methods
router.post('/setup-intent', async (req, res) => {
  try {
    const { customerId, metadata = {} } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const result = await stripeService.createSetupIntent(customerId, metadata);

    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        setupIntentId: result.setupIntentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Setup intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/payments/methods/:customerId - List customer payment methods
router.get('/methods/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await stripeService.listPaymentMethods(customerId);

    if (result.success) {
      res.json({
        success: true,
        paymentMethods: result.paymentMethods
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Payment methods list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/test - Test Stripe connection
router.post('/test', async (req, res) => {
  try {
    // Test Stripe connection by creating a small payment intent
    const result = await stripeService.createPaymentIntent(1, 'usd', { test: true });

    if (result.success) {
      res.json({
        success: true,
        message: 'Stripe connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Stripe connection failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe test failed'
    });
  }
});

module.exports = router;