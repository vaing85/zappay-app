const express = require('express');
const router = express.Router();
const stripeSubscriptionService = require('../services/stripeSubscriptionService');
const { paymentLimiter } = require('../middleware/rateLimiting');
const logger = require('../middleware/logger');

// Apply rate limiting to all subscription routes
router.use(paymentLimiter);

/**
 * Get available membership plans
 * GET /api/subscriptions/plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = stripeSubscriptionService.getMembershipPlans();
    
    res.json({
      success: true,
      plans,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Membership plans error', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve membership plans',
      error: error.message
    });
  }
});

/**
 * Create a product
 * POST /api/subscriptions/products
 */
router.post('/products', async (req, res) => {
  try {
    const { name, description, metadata, images, active } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    const result = await stripeSubscriptionService.createProduct({
      name,
      description,
      metadata,
      images,
      active
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        product: result.product,
        message: 'Product created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Product creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

/**
 * Create a price for a product
 * POST /api/subscriptions/prices
 */
router.post('/prices', async (req, res) => {
  try {
    const { productId, unitAmount, currency, recurring, metadata, active } = req.body;
    
    if (!productId || !unitAmount) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and unit amount are required'
      });
    }
    
    const result = await stripeSubscriptionService.createPrice({
      productId,
      unitAmount,
      currency,
      recurring,
      metadata,
      active
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        price: result.price,
        message: 'Price created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Price creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create price',
      error: error.message
    });
  }
});

/**
 * Create a subscription
 * POST /api/subscriptions
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      priceId,
      paymentMethodId,
      trialPeriodDays,
      metadata
    } = req.body;
    
    if (!customerId || !priceId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, price ID, and payment method ID are required'
      });
    }
    
    const result = await stripeSubscriptionService.createSubscription({
      customerId,
      priceId,
      paymentMethodId,
      trialPeriodDays,
      metadata
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        subscription: result.subscription,
        message: 'Subscription created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Subscription creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

/**
 * Get subscription details
 * GET /api/subscriptions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await stripeSubscriptionService.getSubscription(id);
    
    if (result.success) {
      res.json({
        success: true,
        subscription: result.subscription
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Subscription retrieval error', {
      error: error.message,
      subscriptionId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription',
      error: error.message
    });
  }
});

/**
 * Update subscription
 * PUT /api/subscriptions/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { priceId, quantity, prorationBehavior, metadata } = req.body;
    
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: 'Price ID is required'
      });
    }
    
    const result = await stripeSubscriptionService.updateSubscription(id, {
      priceId,
      quantity,
      prorationBehavior,
      metadata
    });
    
    if (result.success) {
      res.json({
        success: true,
        subscription: result.subscription,
        message: 'Subscription updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Subscription update error', {
      error: error.message,
      subscriptionId: req.params.id,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

/**
 * Cancel subscription
 * DELETE /api/subscriptions/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { immediately = false } = req.query;
    
    const result = await stripeSubscriptionService.cancelSubscription(id, immediately === 'true');
    
    if (result.success) {
      res.json({
        success: true,
        subscription: result.subscription,
        message: 'Subscription cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Subscription cancellation error', {
      error: error.message,
      subscriptionId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

/**
 * Resume subscription
 * POST /api/subscriptions/:id/resume
 */
router.post('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await stripeSubscriptionService.resumeSubscription(id);
    
    if (result.success) {
      res.json({
        success: true,
        subscription: result.subscription,
        message: 'Subscription resumed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Subscription resume error', {
      error: error.message,
      subscriptionId: req.params.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to resume subscription',
      error: error.message
    });
  }
});

/**
 * List customer subscriptions
 * GET /api/subscriptions/customer/:customerId
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 10, startingAfter, endingBefore, status = 'all' } = req.query;
    
    const result = await stripeSubscriptionService.listCustomerSubscriptions(customerId, {
      limit: parseInt(limit),
      startingAfter,
      endingBefore,
      status
    });
    
    if (result.success) {
      res.json({
        success: true,
        subscriptions: result.subscriptions,
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
    logger.error('Customer subscriptions listing error', {
      error: error.message,
      customerId: req.params.customerId,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to list customer subscriptions',
      error: error.message
    });
  }
});

/**
 * Get user subscription status
 * GET /api/subscriptions/status/:customerId
 */
router.get('/status/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const result = await stripeSubscriptionService.getUserSubscriptionStatus(customerId);
    
    if (result.success) {
      res.json({
        success: true,
        hasActiveSubscription: result.hasActiveSubscription,
        subscription: result.subscription,
        plan: result.plan
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
  } catch (error) {
    logger.error('User subscription status error', {
      error: error.message,
      customerId: req.params.customerId
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get user subscription status',
      error: error.message
    });
  }
});

/**
 * Create customer portal session
 * POST /api/subscriptions/portal
 */
router.post('/portal', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    
    if (!customerId || !returnUrl) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and return URL are required'
      });
    }
    
    const result = await stripeSubscriptionService.createCustomerPortalSession(customerId, returnUrl);
    
    if (result.success) {
      res.json({
        success: true,
        session: result.session,
        message: 'Customer portal session created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Customer portal session creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create customer portal session',
      error: error.message
    });
  }
});

/**
 * Create checkout session for subscription
 * POST /api/subscriptions/checkout
 */
router.post('/checkout', async (req, res) => {
  try {
    const {
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      trialPeriodDays,
      metadata
    } = req.body;
    
    if (!customerId || !priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, price ID, success URL, and cancel URL are required'
      });
    }
    
    const result = await stripeSubscriptionService.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      trialPeriodDays,
      metadata
    });
    
    if (result.success) {
      res.json({
        success: true,
        session: result.session,
        message: 'Checkout session created successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    logger.error('Checkout session creation error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

/**
 * Health check for subscription endpoints
 * GET /api/subscriptions/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stripe subscription endpoints are healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /plans',
      'POST /products',
      'POST /prices',
      'POST /',
      'GET /:id',
      'PUT /:id',
      'DELETE /:id',
      'POST /:id/resume',
      'GET /customer/:customerId',
      'GET /status/:customerId',
      'POST /portal',
      'POST /checkout'
    ]
  });
});

module.exports = router;

