const express = require('express');
const router = express.Router();

// POST /api/payments/send - Send payment
router.post('/send', (req, res) => {
  res.json({
    success: true,
    message: 'Payment sent successfully'
  });
});

// POST /api/payments/request - Request payment
router.post('/request', (req, res) => {
  res.json({
    success: true,
    message: 'Payment request created successfully'
  });
});

module.exports = router;
