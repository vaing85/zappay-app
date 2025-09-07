const express = require('express');
const router = express.Router();

// GET /api/users/profile - Get user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint',
    user: req.user
  });
});

// PUT /api/users/profile - Update user profile
router.put('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

module.exports = router;
