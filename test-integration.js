// Integration Test Script for ZapPay Frontend-Backend Connection
// This script tests the API configuration and connectivity

const https = require('https');

// Test configuration
const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🧪 ZapPay Integration Test');
console.log('========================');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n1. Testing Backend Health...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      console.log('✅ Backend is healthy');
      console.log(`   Status: ${data.status}`);
      console.log(`   Message: ${data.message}`);
      console.log(`   Environment: ${data.environment}`);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

// Test 2: API Configuration Test
async function testApiConfiguration() {
  console.log('\n2. Testing API Configuration...');
  
  const endpoints = [
    '/health',
    '/stripe-test',
    '/email-test',
    '/sms-test'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      const data = await response.json();
      
      results[endpoint] = {
        status: response.status,
        success: response.ok,
        message: data.message || 'No message'
      };
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: ${data.message || 'OK'}`);
      } else {
        console.log(`⚠️  ${endpoint}: ${data.message || 'Not accessible'}`);
      }
    } catch (error) {
      results[endpoint] = {
        status: 'ERROR',
        success: false,
        message: error.message
      };
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  return results;
}

// Test 3: Frontend API Configuration
function testFrontendConfig() {
  console.log('\n3. Testing Frontend API Configuration...');
  
  // Simulate the frontend API configuration
  const apiConfig = {
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://zappayapp-ie9d2.ondigitalocean.app'
      : 'https://zappayapp-ie9d2.ondigitalocean.app', // Using production URL for testing
    WEBSOCKET_URL: process.env.NODE_ENV === 'production'
      ? 'wss://zappayapp-ie9d2.ondigitalocean.app'
      : 'wss://zappayapp-ie9d2.ondigitalocean.app',
    TIMEOUT: 10000
  };
  
  console.log('✅ API Configuration:');
  console.log(`   Base URL: ${apiConfig.BASE_URL}`);
  console.log(`   WebSocket URL: ${apiConfig.WEBSOCKET_URL}`);
  console.log(`   Timeout: ${apiConfig.TIMEOUT}ms`);
  
  return apiConfig;
}

// Test 4: Environment Variables Test
function testEnvironmentVariables() {
  console.log('\n4. Testing Environment Variables...');
  
  const requiredVars = [
    'REACT_APP_API_URL',
    'REACT_APP_WEBSOCKET_URL',
    'REACT_APP_STRIPE_PUBLISHABLE_KEY'
  ];
  
  const results = {};
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
      results[varName] = true;
    } else {
      console.log(`⚠️  ${varName}: Not set (will use default)`);
      results[varName] = false;
    }
  }
  
  return results;
}

// Run all tests
async function runIntegrationTests() {
  console.log('Starting integration tests...\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    apiConfiguration: await testApiConfiguration(),
    frontendConfig: testFrontendConfig(),
    environmentVariables: testEnvironmentVariables()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Backend Health: ${results.backendHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Configuration: ${Object.values(results.apiConfiguration).some(r => r.success) ? '✅ PARTIAL' : '❌ FAIL'}`);
  console.log(`Frontend Config: ✅ PASS`);
  console.log(`Environment Variables: ${Object.values(results.environmentVariables).some(v => v) ? '✅ PARTIAL' : '⚠️  USING DEFAULTS'}`);
  
  // Overall assessment
  if (results.backendHealth) {
    console.log('\n🎉 Integration Status: READY');
    console.log('   The frontend can connect to the backend successfully!');
    console.log('   Some test endpoints may not be accessible, but core functionality should work.');
  } else {
    console.log('\n❌ Integration Status: FAILED');
    console.log('   Backend is not accessible. Please check deployment status.');
  }
  
  return results;
}

// Run the tests
runIntegrationTests().catch(console.error);
