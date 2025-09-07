const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const groupRoutes = require('./routes/groups');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');

// Import simplified middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth-simple');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'ZapPay Backend is running!'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Basic API endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'ZapPay API is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 ZapPay Backend Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
});

module.exports = app;
