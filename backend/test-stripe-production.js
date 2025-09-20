#!/usr/bin/env node

/**
 * Stripe Production Testing Script
 * This script tests Stripe integration for production deployment
 */

const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_CONFIG = {
  testAmount: 10.00,
  testCurrency: 'usd',
  testEmail: 'test@zappay.com',
  testName: 'Test User',
  testPhone: '+1234567890'
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

// Test Stripe configuration
const testStripeConfig = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    throw new Error('STRIPE_PUBLISHABLE_KEY not set');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('⚠️ STRIPE_WEBHOOK_SECRET not set (optional for testing)');
  }
};

// Test Stripe health endpoint
const testStripeHealth = async () => {
  const response = await axios.get(`${BASE_URL}/stripe-health`);
  if (response.status !== 200) {
    throw new Error(`Stripe health check returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`Stripe health check failed: ${response.data.message}`);
  }
};

// Test payment methods endpoint
const testPaymentMethods = async () => {
  const response = await axios.get(`${BASE_URL}/api/payments/methods`);
  
  if (response.status !== 200) {
    throw new Error(`Payment methods endpoint returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment methods request failed: ${response.data.message}`);
  }
  
  if (!Array.isArray(response.data.paymentMethods)) {
    throw new Error('Payment methods should be an array');
  }
};

// Test currencies endpoint
const testCurrencies = async () => {
  const response = await axios.get(`${BASE_URL}/api/payments/currencies`);
  
  if (response.status !== 200) {
    throw new Error(`Currencies endpoint returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Currencies request failed: ${response.data.message}`);
  }
  
  if (!Array.isArray(response.data.currencies)) {
    throw new Error('Currencies should be an array');
  }
};

// Test customer creation
const testCustomerCreation = async () => {
  const customerData = {
    email: TEST_CONFIG.testEmail,
    name: TEST_CONFIG.testName,
    phone: TEST_CONFIG.testPhone,
    metadata: {
      test: true,
      timestamp: Date.now()
    }
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/customers`, customerData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Customer creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Customer creation failed: ${response.data.message}`);
  }
  
  if (!response.data.customer || !response.data.customer.id) {
    throw new Error('Customer ID not returned');
  }
  
  return response.data.customer.id;
};

// Test payment method creation
const testPaymentMethodCreation = async () => {
  const paymentMethodData = {
    type: 'card',
    card: {
      number: '4242424242424242', // Test card number
      exp_month: 12,
      exp_year: 2025,
      cvc: '123'
    },
    billingDetails: {
      name: TEST_CONFIG.testName,
      email: TEST_CONFIG.testEmail
    }
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/payment-methods`, paymentMethodData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Payment method creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment method creation failed: ${response.data.message}`);
  }
  
  if (!response.data.paymentMethod || !response.data.paymentMethod.id) {
    throw new Error('Payment method ID not returned');
  }
  
  return response.data.paymentMethod.id;
};

// Test payment intent creation
const testPaymentIntentCreation = async () => {
  const paymentIntentData = {
    amount: TEST_CONFIG.testAmount,
    currency: TEST_CONFIG.testCurrency,
    description: 'Test payment intent',
    metadata: {
      test: true,
      timestamp: Date.now()
    }
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/intents`, paymentIntentData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Payment intent creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment intent creation failed: ${response.data.message}`);
  }
  
  if (!response.data.paymentIntent || !response.data.paymentIntent.id) {
    throw new Error('Payment intent ID not returned');
  }
  
  return response.data.paymentIntent.id;
};

// Test payment intent retrieval
const testPaymentIntentRetrieval = async (paymentIntentId) => {
  const response = await axios.get(`${BASE_URL}/api/payments/intents/${paymentIntentId}`);
  
  if (response.status !== 200) {
    throw new Error(`Payment intent retrieval returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment intent retrieval failed: ${response.data.message}`);
  }
  
  if (!response.data.paymentIntent || response.data.paymentIntent.id !== paymentIntentId) {
    throw new Error('Payment intent data mismatch');
  }
};

// Test payment intent cancellation
const testPaymentIntentCancellation = async (paymentIntentId) => {
  const response = await axios.post(`${BASE_URL}/api/payments/intents/${paymentIntentId}/cancel`);
  
  if (response.status !== 200) {
    throw new Error(`Payment intent cancellation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment intent cancellation failed: ${response.data.message}`);
  }
  
  if (response.data.paymentIntent.status !== 'canceled') {
    throw new Error('Payment intent not canceled');
  }
};

// Test webhook endpoints
const testWebhookEndpoints = async () => {
  const webhookEndpoints = [
    '/api/payments/webhook/stripe/health'
  ];
  
  for (const endpoint of webhookEndpoints) {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    if (response.status !== 200) {
      throw new Error(`Webhook endpoint ${endpoint} health check failed`);
    }
  }
};

// Test production security (rate limiting)
const testProductionSecurity = async () => {
  // Test rate limiting
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(axios.get(`${BASE_URL}/api/payments/methods`).catch(err => err.response));
  }
  
  const responses = await Promise.all(promises);
  const rateLimited = responses.filter(r => r && r.status === 429);
  
  if (rateLimited.length === 0) {
    throw new Error('Rate limiting not working for payment endpoints');
  }
};

// Test error handling
const testErrorHandling = async () => {
  // Test invalid payment intent creation
  const invalidData = {
    amount: -10, // Invalid amount
    currency: 'usd'
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/intents`, invalidData);
  
  if (response.status !== 400) {
    throw new Error('Invalid data should return 400 status');
  }
  
  if (response.data.success !== false) {
    throw new Error('Invalid data should return success: false');
  }
};

// Main testing function
const runAllTests = async () => {
  console.log('🚀 Starting Stripe Production Tests...');
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log(`💰 Test Amount: $${TEST_CONFIG.testAmount}`);
  console.log(`💱 Test Currency: ${TEST_CONFIG.testCurrency.toUpperCase()}`);
  console.log(`📧 Test Email: ${TEST_CONFIG.testEmail}`);
  console.log('');
  
  // Configuration tests
  await runTest('Stripe Configuration', testStripeConfig);
  await runTest('Stripe Health Check', testStripeHealth);
  
  // API endpoint tests
  await runTest('Payment Methods Endpoint', testPaymentMethods);
  await runTest('Currencies Endpoint', testCurrencies);
  await runTest('Webhook Endpoints', testWebhookEndpoints);
  
  // Customer and payment method tests
  let customerId;
  await runTest('Customer Creation', async () => {
    customerId = await testCustomerCreation();
  });
  
  let paymentMethodId;
  await runTest('Payment Method Creation', async () => {
    paymentMethodId = await testPaymentMethodCreation();
  });
  
  // Payment intent tests
  let paymentIntentId;
  await runTest('Payment Intent Creation', async () => {
    paymentIntentId = await testPaymentIntentCreation();
  });
  
  await runTest('Payment Intent Retrieval', async () => {
    await testPaymentIntentRetrieval(paymentIntentId);
  });
  
  await runTest('Payment Intent Cancellation', async () => {
    await testPaymentIntentCancellation(paymentIntentId);
  });
  
  // Security and error handling tests
  await runTest('Production Security', testProductionSecurity);
  await runTest('Error Handling', testErrorHandling);
  
  // Print results
  console.log('');
  console.log('📊 Stripe Production Test Results:');
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
    console.log('🎉 All Stripe production tests passed! Ready for live deployment.');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please fix the issues before going live.');
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Stripe test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  runTest,
  testResults
};
