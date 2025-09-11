#!/usr/bin/env node

/**
 * ZapPay Production Testing Script
 * This script tests all production endpoints and services
 */

const axios = require('axios');
const https = require('https');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_USER = {
  email: 'test@zappay.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Helper function to run a test
const runTest = async (name, testFn) => {
  testResults.total++;
  console.log(`🧪 Testing: ${name}`);
  
  try {
    await testFn();
    console.log(`✅ ${name} - PASSED`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
  }
};

// Test health endpoint
const testHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  if (response.status !== 200) {
    throw new Error(`Health check returned status ${response.status}`);
  }
  if (!response.data.status || response.data.status !== 'healthy') {
    throw new Error('Health check returned unhealthy status');
  }
};

// Test metrics endpoint
const testMetrics = async () => {
  const response = await axios.get(`${BASE_URL}/metrics`);
  if (response.status !== 200) {
    throw new Error(`Metrics endpoint returned status ${response.status}`);
  }
  if (!response.data.uptime || !response.data.memory) {
    throw new Error('Metrics endpoint missing required data');
  }
};

// Test Stripe connection
const testStripe = async () => {
  const response = await axios.get(`${BASE_URL}/stripe-test`);
  if (response.status !== 200) {
    throw new Error(`Stripe test returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`Stripe test failed: ${response.data.message}`);
  }
};

// Test SendGrid connection
const testSendGrid = async () => {
  const response = await axios.get(`${BASE_URL}/email-test`);
  if (response.status !== 200) {
    throw new Error(`SendGrid test returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`SendGrid test failed: ${response.data.message}`);
  }
};

// Test Twilio connection
const testTwilio = async () => {
  const response = await axios.post(`${BASE_URL}/sms-test`, {
    phoneNumber: TEST_USER.phone
  });
  if (response.status !== 200) {
    throw new Error(`Twilio test returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`Twilio test failed: ${response.data.message}`);
  }
};

// Test user registration
const testUserRegistration = async () => {
  const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
  if (response.status !== 201) {
    throw new Error(`User registration returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`User registration failed: ${response.data.message}`);
  }
};

// Test user login
const testUserLogin = async () => {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  if (response.status !== 200) {
    throw new Error(`User login returned status ${response.status}`);
  }
  if (!response.data.success || !response.data.token) {
    throw new Error(`User login failed: ${response.data.message}`);
  }
  return response.data.token;
};

// Test protected endpoints
const testProtectedEndpoints = async (token) => {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test user profile
  const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, { headers });
  if (profileResponse.status !== 200) {
    throw new Error(`Profile endpoint returned status ${profileResponse.status}`);
  }
  
  // Test transactions
  const transactionsResponse = await axios.get(`${BASE_URL}/api/transactions`, { headers });
  if (transactionsResponse.status !== 200) {
    throw new Error(`Transactions endpoint returned status ${transactionsResponse.status}`);
  }
  
  // Test groups
  const groupsResponse = await axios.get(`${BASE_URL}/api/groups`, { headers });
  if (groupsResponse.status !== 200) {
    throw new Error(`Groups endpoint returned status ${groupsResponse.status}`);
  }
  
  // Test budgets
  const budgetsResponse = await axios.get(`${BASE_URL}/api/budgets`, { headers });
  if (budgetsResponse.status !== 200) {
    throw new Error(`Budgets endpoint returned status ${budgetsResponse.status}`);
  }
};

// Test rate limiting
const testRateLimiting = async () => {
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(axios.get(`${BASE_URL}/api/auth/login`).catch(err => err.response));
  }
  
  const responses = await Promise.all(promises);
  const rateLimited = responses.filter(r => r && r.status === 429);
  
  if (rateLimited.length === 0) {
    throw new Error('Rate limiting not working properly');
  }
};

// Test CORS
const testCORS = async () => {
  const response = await axios.options(`${BASE_URL}/api/auth/login`, {
    headers: {
      'Origin': 'https://zappay.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  });
  
  if (response.status !== 200) {
    throw new Error(`CORS preflight returned status ${response.status}`);
  }
  
  const corsHeaders = response.headers;
  if (!corsHeaders['access-control-allow-origin']) {
    throw new Error('CORS headers missing');
  }
};

// Test security headers
const testSecurityHeaders = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  const headers = response.headers;
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy'
  ];
  
  for (const header of requiredHeaders) {
    if (!headers[header]) {
      throw new Error(`Missing security header: ${header}`);
    }
  }
};

// Test database connection
const testDatabase = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  if (response.data.database !== 'connected') {
    throw new Error('Database not connected');
  }
};

// Test Redis connection
const testRedis = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  if (response.data.redis !== 'connected') {
    throw new Error('Redis not connected');
  }
};

// Main testing function
const runAllTests = async () => {
  console.log('🚀 Starting ZapPay Production Tests...');
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log('');
  
  // Basic connectivity tests
  await runTest('Health Check', testHealth);
  await runTest('Metrics Endpoint', testMetrics);
  await runTest('Database Connection', testDatabase);
  await runTest('Redis Connection', testRedis);
  
  // External service tests
  await runTest('Stripe Connection', testStripe);
  await runTest('SendGrid Connection', testSendGrid);
  await runTest('Twilio Connection', testTwilio);
  
  // Security tests
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('CORS Configuration', testCORS);
  await runTest('Rate Limiting', testRateLimiting);
  
  // Authentication tests
  await runTest('User Registration', testUserRegistration);
  const token = await runTest('User Login', testUserLogin);
  
  // Protected endpoint tests
  if (token) {
    await runTest('Protected Endpoints', () => testProtectedEndpoints(token));
  }
  
  // Print results
  console.log('');
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.name}: ${error.error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('');
    console.log('🎉 All tests passed! Production is ready.');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please fix the issues before deploying.');
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  runTest,
  testResults
};
