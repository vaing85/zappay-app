#!/usr/bin/env node

/**
 * Rapyd Production Testing Script
 * This script tests Rapyd integration for production deployment
 */

const axios = require('axios');
const { 
  RAPYD_PRODUCTION_CONFIG,
  getProductionRapydHeaders,
  validatePaymentAmount,
  isCountrySupported,
  isCurrencySupported,
  getProductionErrorMessage
} = require('./config/rapyd-production');
require('dotenv').config();

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_CONFIG = {
  testAmount: 10.00,
  testCurrency: 'USD',
  testCountry: 'US',
  testEmail: 'test@zappay.com',
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

// Test Rapyd configuration
const testRapydConfig = async () => {
  if (!RAPYD_PRODUCTION_CONFIG.ACCESS_KEY) {
    throw new Error('RAPYD_ACCESS_KEY not set');
  }
  if (!RAPYD_PRODUCTION_CONFIG.SECRET_KEY) {
    throw new Error('RAPYD_SECRET_KEY not set');
  }
  if (RAPYD_PRODUCTION_CONFIG.BASE_URL !== 'https://api.rapyd.net') {
    throw new Error('RAPYD_BASE_URL not set to production URL');
  }
};

// Test Rapyd health endpoint
const testRapydHealth = async () => {
  const response = await axios.get(`${BASE_URL}/rapyd-health`);
  if (response.status !== 200) {
    throw new Error(`Rapyd health check returned status ${response.status}`);
  }
  if (!response.data.success) {
    throw new Error(`Rapyd health check failed: ${response.data.message}`);
  }
};

// Test payment amount validation
const testPaymentValidation = async () => {
  // Test valid amount
  const validResult = validatePaymentAmount(10.00, 'USD');
  if (!validResult.valid) {
    throw new Error('Valid payment amount was rejected');
  }
  
  // Test amount too small
  const smallResult = validatePaymentAmount(0.005, 'USD');
  if (smallResult.valid) {
    throw new Error('Amount too small was accepted');
  }
  
  // Test amount too large
  const largeResult = validatePaymentAmount(200000, 'USD');
  if (largeResult.valid) {
    throw new Error('Amount too large was accepted');
  }
};

// Test country support
const testCountrySupport = async () => {
  if (!isCountrySupported('US')) {
    throw new Error('US should be supported');
  }
  if (!isCountrySupported('GB')) {
    throw new Error('GB should be supported');
  }
  if (isCountrySupported('XX')) {
    throw new Error('XX should not be supported');
  }
};

// Test currency support
const testCurrencySupport = async () => {
  if (!isCurrencySupported('USD')) {
    throw new Error('USD should be supported');
  }
  if (!isCurrencySupported('EUR')) {
    throw new Error('EUR should be supported');
  }
  if (isCurrencySupported('XXX')) {
    throw new Error('XXX should not be supported');
  }
};

// Test error message generation
const testErrorMessageGeneration = async () => {
  const insufficientFunds = getProductionErrorMessage('INSUFFICIENT_FUNDS');
  if (!insufficientFunds || insufficientFunds === 'An unexpected error occurred') {
    throw new Error('Error message generation failed');
  }
  
  const unknownError = getProductionErrorMessage('UNKNOWN_ERROR');
  if (unknownError !== 'An unexpected error occurred') {
    throw new Error('Unknown error should return default message');
  }
};

// Test Rapyd signature generation
const testSignatureGeneration = async () => {
  const headers = getProductionRapydHeaders('GET', '/v1/payment_methods', '');
  
  if (!headers.access_key) {
    throw new Error('Access key missing from headers');
  }
  if (!headers.salt) {
    throw new Error('Salt missing from headers');
  }
  if (!headers.timestamp) {
    throw new Error('Timestamp missing from headers');
  }
  if (!headers.signature) {
    throw new Error('Signature missing from headers');
  }
  if (!headers['User-Agent']) {
    throw new Error('User-Agent missing from headers');
  }
};

// Test payment methods endpoint
const testPaymentMethods = async () => {
  const response = await axios.get(`${BASE_URL}/api/payments/methods`, {
    params: { country: TEST_CONFIG.testCountry }
  });
  
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

// Test customer wallet creation
const testCustomerWalletCreation = async () => {
  const customerData = {
    customerId: `test_${Date.now()}`,
    firstName: 'Test',
    lastName: 'User',
    email: TEST_CONFIG.testEmail,
    phoneNumber: TEST_CONFIG.testPhone,
    country: TEST_CONFIG.testCountry
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/customer-wallet`, customerData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Customer wallet creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Customer wallet creation failed: ${response.data.message}`);
  }
};

// Test payment creation
const testPaymentCreation = async () => {
  const paymentData = {
    amount: TEST_CONFIG.testAmount,
    currency: TEST_CONFIG.testCurrency,
    paymentMethod: 'card',
    customerId: `test_${Date.now()}`,
    description: 'Test payment',
    redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
    cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/create`, paymentData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Payment creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`Payment creation failed: ${response.data.message}`);
  }
};

// Test P2P payment creation
const testP2PPaymentCreation = async () => {
  const p2pData = {
    fromWalletId: `test_from_${Date.now()}`,
    toWalletId: `test_to_${Date.now()}`,
    amount: TEST_CONFIG.testAmount,
    currency: TEST_CONFIG.testCurrency,
    description: 'Test P2P payment'
  };
  
  const response = await axios.post(`${BASE_URL}/api/payments/p2p`, p2pData);
  
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`P2P payment creation returned status ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error(`P2P payment creation failed: ${response.data.message}`);
  }
};

// Test webhook endpoints
const testWebhookEndpoints = async () => {
  const webhookEndpoints = [
    '/api/payments/webhook/success',
    '/api/payments/webhook/failed',
    '/api/payments/webhook/pending',
    '/api/payments/webhook/refund',
    '/api/payments/webhook/p2p-success',
    '/api/payments/webhook/generic'
  ];
  
  for (const endpoint of webhookEndpoints) {
    const response = await axios.get(`${BASE_URL}${endpoint}/health`);
    if (response.status !== 200) {
      throw new Error(`Webhook endpoint ${endpoint} health check failed`);
    }
  }
};

// Test production security
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

// Main testing function
const runAllTests = async () => {
  console.log('🚀 Starting Rapyd Production Tests...');
  console.log(`📡 Testing against: ${BASE_URL}`);
  console.log(`🌍 Test Country: ${TEST_CONFIG.testCountry}`);
  console.log(`💰 Test Currency: ${TEST_CONFIG.testCurrency}`);
  console.log(`💵 Test Amount: $${TEST_CONFIG.testAmount}`);
  console.log('');
  
  // Configuration tests
  await runTest('Rapyd Configuration', testRapydConfig);
  await runTest('Payment Amount Validation', testPaymentValidation);
  await runTest('Country Support', testCountrySupport);
  await runTest('Currency Support', testCurrencySupport);
  await runTest('Error Message Generation', testErrorMessageGeneration);
  await runTest('Signature Generation', testSignatureGeneration);
  
  // API endpoint tests
  await runTest('Rapyd Health Check', testRapydHealth);
  await runTest('Payment Methods Endpoint', testPaymentMethods);
  await runTest('Customer Wallet Creation', testCustomerWalletCreation);
  await runTest('Payment Creation', testPaymentCreation);
  await runTest('P2P Payment Creation', testP2PPaymentCreation);
  await runTest('Webhook Endpoints', testWebhookEndpoints);
  
  // Security tests
  await runTest('Production Security', testProductionSecurity);
  
  // Print results
  console.log('');
  console.log('📊 Rapyd Production Test Results:');
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
    console.log('🎉 All Rapyd production tests passed! Ready for live deployment.');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please fix the issues before going live.');
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Rapyd test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  runTest,
  testResults
};
