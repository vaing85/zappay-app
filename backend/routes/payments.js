const express = require('express');
const router = express.Router();
const rapydService = require('../services/rapydPaymentService');
const { authenticateToken } = require('../middleware/auth');

// POST /api/payments/create - Create payment
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'USD', 
      paymentMethod, 
      description, 
      metadata = {},
      redirectUrl,
      cancelUrl
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    const paymentData = {
      amount,
      currency,
      paymentMethod,
      customerId: req.user.id,
      description,
      metadata: {
        ...metadata,
        userId: req.user.id,
        userEmail: req.user.email
      },
      redirectUrl,
      cancelUrl
    };

    const result = await rapydService.createPayment(paymentData);

    if (result.success) {
      res.json({
        success: true,
        paymentId: result.paymentId,
        status: result.status,
        redirectUrl: result.redirectUrl,
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
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/payments/status/:id - Get payment status
router.get('/status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await rapydService.getPaymentStatus(id);

    if (result.success) {
      res.json({
        success: true,
        status: result.status,
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
    console.error('Payment status retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/create-wallet - Create customer wallet
router.post('/create-wallet', authenticateToken, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      country, 
      currency = 'USD' 
    } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required'
      });
    }

    const customerData = {
      customerId: req.user.id,
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || req.user.phoneNumber,
      country: country || 'US',
      currency
    };

    const result = await rapydService.createCustomerWallet(customerData);

    if (result.success) {
      res.json({
        success: true,
        customerId: result.customerId,
        walletId: result.walletId,
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
    console.error('Wallet creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/p2p - Create P2P payment
router.post('/p2p', authenticateToken, async (req, res) => {
  try {
    const { 
      toWalletId, 
      amount, 
      currency = 'USD', 
      description, 
      metadata = {} 
    } = req.body;

    if (!toWalletId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid recipient wallet ID and amount are required'
      });
    }

    const p2pData = {
      fromWalletId: req.user.walletId, // Assuming walletId is stored in user
      toWalletId,
      amount,
      currency,
      description: description || 'ZapPay P2P Transfer',
      metadata: {
        ...metadata,
        fromUserId: req.user.id,
        toUserId: req.body.toUserId
      }
    };

    const result = await rapydService.createP2PPayment(p2pData);

    if (result.success) {
      res.json({
        success: true,
        transferId: result.transferId,
        status: result.status,
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
    console.error('P2P payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/payments/methods/:country - Get available payment methods for country
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
    console.error('Payment methods list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/payments/refund - Refund a payment
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment ID and amount are required'
      });
    }

    const result = await rapydService.refundPayment(paymentId, amount, reason);

    if (result.success) {
      res.json({
        success: true,
        refundId: result.refundId,
        status: result.status,
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
    console.error('Payment refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/payments/balance/:walletId - Get wallet balance
router.get('/balance/:walletId', authenticateToken, async (req, res) => {
  try {
    const { walletId } = req.params;
    const result = await rapydService.getWalletBalance(walletId);

    if (result.success) {
      res.json({
        success: true,
        balance: result.balance,
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
    console.error('Wallet balance retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
      status: 'error'
    });
  }
});

// POST /api/payments/test - Test Rapyd connection (requires auth)
router.post('/test', async (req, res) => {
  try {
    // Test Rapyd connection by getting payment methods for US
    const result = await rapydService.getPaymentMethods('US');

    if (result.success) {
      res.json({
        success: true,
        message: 'Rapyd connection successful',
        timestamp: new Date().toISOString(),
        availableMethods: result.paymentMethods?.length || 0
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Rapyd connection failed: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Rapyd test error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapyd test failed'
    });
  }
});

module.exports = router;