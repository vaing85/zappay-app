const express = require('express');
const router = express.Router();

// GET /api/transactions - Get user transactions
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Transactions endpoint',
    transactions: []
  });
});

// POST /api/transactions - Create new transaction
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Transaction created successfully'
  });
});

module.exports = router;
