const express = require('express');
const router = express.Router();
const { 
  validateProductionWebhookSignature,
  getProductionErrorMessage,
  RAPYD_PRODUCTION_CONFIG 
} = require('../config/rapyd-production');
const { securityLogger } = require('../middleware/productionMonitoring');
const logger = require('../middleware/logger');

/**
 * Rapyd Webhook Handler for Production
 * Handles all Rapyd webhook events securely
 */

// Middleware to validate Rapyd webhook signature
const validateRapydWebhook = (req, res, next) => {
  try {
    const signature = req.headers['rapyd-signature'];
    const salt = req.headers['rapyd-salt'];
    const timestamp = req.headers['rapyd-timestamp'];
    
    if (!signature || !salt || !timestamp) {
      securityLogger('RAPYD_WEBHOOK_INVALID_HEADERS', {
        headers: req.headers,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        success: false,
        error: 'Missing required webhook headers'
      });
    }
    
    const body = JSON.stringify(req.body);
    const isValid = validateProductionWebhookSignature(signature, body, salt, timestamp);
    
    if (!isValid) {
      securityLogger('RAPYD_WEBHOOK_INVALID_SIGNATURE', {
        signature,
        salt,
        timestamp,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Webhook validation error', {
      error: error.message,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      error: 'Webhook validation failed'
    });
  }
};

// Payment Success Webhook
router.post('/success', validateRapydWebhook, async (req, res) => {
  try {
    const { data } = req.body;
    const { id, status, amount, currency, customer, metadata } = data;
    
    logger.info('Payment success webhook received', {
      paymentId: id,
      status,
      amount,
      currency,
      customerId: customer
    });
    
    // Update payment status in database
    // TODO: Implement database update logic
    // await updatePaymentStatus(id, 'completed', data);
    
    // Send success notification to user
    // TODO: Implement notification logic
    // await sendPaymentSuccessNotification(customer, amount, currency);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('Payment success webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process payment success webhook'
    });
  }
});

// Payment Failed Webhook
router.post('/failed', validateRapydWebhook, async (req, res) => {
  try {
    const { data } = req.body;
    const { id, status, amount, currency, customer, failure_reason } = data;
    
    logger.info('Payment failed webhook received', {
      paymentId: id,
      status,
      amount,
      currency,
      customerId: customer,
      failureReason: failure_reason
    });
    
    // Update payment status in database
    // TODO: Implement database update logic
    // await updatePaymentStatus(id, 'failed', data);
    
    // Send failure notification to user
    // TODO: Implement notification logic
    // await sendPaymentFailureNotification(customer, amount, currency, failure_reason);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('Payment failed webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process payment failed webhook'
    });
  }
});

// Payment Pending Webhook
router.post('/pending', validateRapydWebhook, async (req, res) => {
  try {
    const { data } = req.body;
    const { id, status, amount, currency, customer } = data;
    
    logger.info('Payment pending webhook received', {
      paymentId: id,
      status,
      amount,
      currency,
      customerId: customer
    });
    
    // Update payment status in database
    // TODO: Implement database update logic
    // await updatePaymentStatus(id, 'pending', data);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('Payment pending webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process payment pending webhook'
    });
  }
});

// Refund Success Webhook
router.post('/refund', validateRapydWebhook, async (req, res) => {
  try {
    const { data } = req.body;
    const { id, status, amount, currency, original_payment, customer } = data;
    
    logger.info('Refund success webhook received', {
      refundId: id,
      status,
      amount,
      currency,
      originalPaymentId: original_payment,
      customerId: customer
    });
    
    // Update refund status in database
    // TODO: Implement database update logic
    // await updateRefundStatus(id, 'completed', data);
    
    // Send refund notification to user
    // TODO: Implement notification logic
    // await sendRefundNotification(customer, amount, currency);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('Refund success webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process refund webhook'
    });
  }
});

// P2P Transfer Success Webhook
router.post('/p2p-success', validateRapydWebhook, async (req, res) => {
  try {
    const { data } = req.body;
    const { id, status, amount, currency, source_ewallet, destination_ewallet } = data;
    
    logger.info('P2P transfer success webhook received', {
      transferId: id,
      status,
      amount,
      currency,
      sourceWallet: source_ewallet,
      destinationWallet: destination_ewallet
    });
    
    // Update transfer status in database
    // TODO: Implement database update logic
    // await updateTransferStatus(id, 'completed', data);
    
    // Send transfer notification to both users
    // TODO: Implement notification logic
    // await sendTransferNotification(source_ewallet, destination_ewallet, amount, currency);
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('P2P transfer success webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process P2P transfer webhook'
    });
  }
});

// Generic webhook handler for other events
router.post('/generic', validateRapydWebhook, async (req, res) => {
  try {
    const { type, data } = req.body;
    
    logger.info('Generic webhook received', {
      type,
      data: data
    });
    
    // Handle different webhook types
    switch (type) {
      case 'PAYMENT_UPDATED':
        // Handle payment updates
        break;
      case 'CUSTOMER_UPDATED':
        // Handle customer updates
        break;
      case 'WALLET_UPDATED':
        // Handle wallet updates
        break;
      default:
        logger.warn('Unknown webhook type received', { type });
    }
    
    res.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    logger.error('Generic webhook error', {
      error: error.message,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process generic webhook'
    });
  }
});

// Webhook health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rapyd webhook handler is healthy',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'payment_success',
      'payment_failed',
      'payment_pending',
      'refund_success',
      'p2p_success',
      'generic'
    ]
  });
});

module.exports = router;
