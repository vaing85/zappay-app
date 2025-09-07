const express = require('express');
const router = express.Router();

// GET /api/notifications - Get user notifications
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Notifications endpoint',
    notifications: []
  });
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', (req, res) => {
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

module.exports = router;
