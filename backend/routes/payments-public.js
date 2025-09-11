const express = require('express');
const router = express.Router();
const rapydService = require('../services/rapydPaymentService');

// GET /api/payments/methods/:country - Get available payment methods for country (public)
router.get('/methods/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const result = await rapydService.getPaymentMethods(country);

    if (result.success) {
      res.json({
        success: true,
        paymentMethods: result.paymentMethods,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
});

// GET /api/payments/health - Public health check for Rapyd
router.get('/health', async (req, res) => {
  try {
    // Test Rapyd connection by getting payment methods for US
    const result = await rapydService.getPaymentMethods('US');

    if (result.success) {
      res.json({
        success: true,
        message: 'Rapyd connection successful',
        timestamp: new Date().toISOString(),
        availableMethods: result.paymentMethods?.length || 0,
        status: 'healthy'
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Rapyd connection failed: ${result.error}`,
        status: 'unhealthy'
      });
    }
  } catch (error) {
    console.error('Rapyd health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapyd health check failed',
      error: error.message,
      status: 'error'
    });
  }
});

module.exports = router;
