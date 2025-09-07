const express = require('express');
const router = express.Router();

// GET /api/budgets - Get user budgets
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Budgets endpoint',
    budgets: []
  });
});

// POST /api/budgets - Create new budget
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Budget created successfully'
  });
});

module.exports = router;
