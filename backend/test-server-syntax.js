// Test server syntax by importing modules one by one
console.log('Testing server syntax...');

try {
  console.log('1. Testing basic imports...');
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  console.log('✅ Basic imports successful');

  console.log('2. Testing middleware imports...');
  const { generalLimiter } = require('./middleware/rateLimiting');
  console.log('✅ Middleware imports successful');

  console.log('3. Testing service imports...');
  const rapydService = require('./services/rapydPaymentService');
  console.log('✅ Service imports successful');

  console.log('4. Testing database imports...');
  const { connectDB, connectRedis } = require('./config/database');
  console.log('✅ Database imports successful');

  console.log('✅ All imports successful - no syntax errors found');
} catch (error) {
  console.error('❌ Error found:', error.message);
  console.error('Stack:', error.stack);
}
