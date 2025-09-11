#!/usr/bin/env node

/**
 * Rapyd Production Verification Script
 * This script verifies Rapyd integration in your production environment
 */

const axios = require('axios');
require('dotenv').config();

// Configuration - Update with your production URL
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-production-url.com';

console.log('🚀 Verifying Rapyd Production Integration...');
console.log(`📡 Testing against: ${PRODUCTION_URL}`);
console.log('');

// Test Rapyd health endpoint
async function testRapydHealth() {
  try {
    console.log('🧪 Testing Rapyd Health Check...');
    const response = await axios.get(`${PRODUCTION_URL}/rapyd-health`);
    
    if (response.data.success) {
      console.log('✅ Rapyd Health Check - PASSED');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Available Methods: ${response.data.availableMethods}`);
      return true;
    } else {
      console.log('❌ Rapyd Health Check - FAILED');
      console.log(`   Error: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Rapyd Health Check - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test payment methods endpoint
async function testPaymentMethods() {
  try {
    console.log('🧪 Testing Payment Methods...');
    const response = await axios.get(`${PRODUCTION_URL}/api/payments/methods`, {
      params: { country: 'US' }
    });
    
    if (response.data.success) {
      console.log('✅ Payment Methods - PASSED');
      console.log(`   Available Methods: ${response.data.paymentMethods?.length || 0}`);
      return true;
    } else {
      console.log('❌ Payment Methods - FAILED');
      console.log(`   Error: ${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Payment Methods - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test webhook endpoints
async function testWebhookEndpoints() {
  try {
    console.log('🧪 Testing Webhook Endpoints...');
    const webhookEndpoints = [
      '/api/payments/webhook/success/health',
      '/api/payments/webhook/failed/health',
      '/api/payments/webhook/pending/health',
      '/api/payments/webhook/refund/health'
    ];
    
    let allPassed = true;
    
    for (const endpoint of webhookEndpoints) {
      try {
        const response = await axios.get(`${PRODUCTION_URL}${endpoint}`);
        if (response.data.success) {
          console.log(`   ✅ ${endpoint} - OK`);
        } else {
          console.log(`   ❌ ${endpoint} - FAILED`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} - ERROR: ${error.message}`);
        allPassed = false;
      }
    }
    
    if (allPassed) {
      console.log('✅ Webhook Endpoints - PASSED');
    } else {
      console.log('❌ Webhook Endpoints - FAILED');
    }
    
    return allPassed;
  } catch (error) {
    console.log('❌ Webhook Endpoints - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test general health
async function testGeneralHealth() {
  try {
    console.log('🧪 Testing General Health...');
    const response = await axios.get(`${PRODUCTION_URL}/health`);
    
    if (response.data.status === 'healthy') {
      console.log('✅ General Health - PASSED');
      console.log(`   Database: ${response.data.database}`);
      console.log(`   Redis: ${response.data.redis}`);
      return true;
    } else {
      console.log('❌ General Health - FAILED');
      console.log(`   Status: ${response.data.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ General Health - FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main verification function
async function verifyProduction() {
  console.log('🔍 Starting Production Verification...');
  console.log('');
  
  const results = {
    generalHealth: await testGeneralHealth(),
    rapydHealth: await testRapydHealth(),
    paymentMethods: await testPaymentMethods(),
    webhookEndpoints: await testWebhookEndpoints()
  };
  
  console.log('');
  console.log('📊 Verification Results:');
  console.log(`✅ Passed: ${Object.values(results).filter(r => r).length}`);
  console.log(`❌ Failed: ${Object.values(results).filter(r => !r).length}`);
  console.log(`📈 Total: ${Object.keys(results).length}`);
  
  const successRate = Math.round((Object.values(results).filter(r => r).length / Object.keys(results).length) * 100);
  console.log(`📊 Success Rate: ${successRate}%`);
  
  if (successRate === 100) {
    console.log('');
    console.log('🎉 All production verification tests passed!');
    console.log('✅ Your Rapyd integration is working correctly in production.');
    console.log('🚀 You are ready to go live!');
  } else {
    console.log('');
    console.log('⚠️  Some verification tests failed.');
    console.log('🔧 Please check your production configuration.');
  }
  
  return results;
}

// Run verification if called directly
if (require.main === module) {
  verifyProduction().catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  });
}

module.exports = { verifyProduction };
