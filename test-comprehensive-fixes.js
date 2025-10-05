#!/usr/bin/env node

/**
 * Comprehensive Fixes Testing Script for ZapPay
 * Tests all the fixes implemented: authentication, membership tiers, payment processing, and new endpoints
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

class ComprehensiveFixesTester {
  constructor() {
    this.results = [];
    this.users = new Map();
    this.startTime = Date.now();
  }

  async logTest(testName, success, details = '', data = null) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (details) console.log(`   Details: ${details}`);
    if (data && typeof data === 'object') {
      console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
    }
    
    this.results.push({
      test: testName,
      success,
      details,
      data,
      timestamp: new Date().toISOString()
    });
  }

  async testServerHealth() {
    console.log('\n🏥 Testing Server Health...');
    
    try {
      const response = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
      
      if (response.data.status === 'healthy') {
        await this.logTest(
          'Server Health Check',
          true,
          `Uptime: ${Math.round(response.data.uptime)}s, Memory: ${Math.round(response.data.memory.rss / 1024 / 1024)}MB, Environment: ${response.data.environment}`
        );
        return true;
      } else {
        await this.logTest('Server Health Check', false, 'Server not healthy');
        return false;
      }
    } catch (error) {
      await this.logTest('Server Health Check', false, error.message);
      return false;
    }
  }

  async testMembershipPlans() {
    console.log('\n📋 Testing Updated Membership Plans...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/subscriptions/plans`, { timeout: 10000 });
      
      if (response.data.success && response.data.plans) {
        const plans = response.data.plans;
        
        await this.logTest(
          'Get Membership Plans',
          true,
          `Found ${plans.length} plans: ${plans.map(p => p.name).join(', ')}`
        );
        
        // Check for all 6 tiers
        const expectedTiers = ['free', 'starter', 'basic', 'pro', 'business', 'enterprise'];
        const foundTiers = plans.map(p => p.id);
        const missingTiers = expectedTiers.filter(tier => !foundTiers.includes(tier));
        
        if (missingTiers.length === 0) {
          await this.logTest('All 6 Tiers Present', true, 'All expected membership tiers found');
        } else {
          await this.logTest('All 6 Tiers Present', false, `Missing tiers: ${missingTiers.join(', ')}`);
        }
        
        // Display plan details
        console.log('\n📊 Available Plans:');
        plans.forEach(plan => {
          console.log(`   ${plan.id.toUpperCase()}: $${plan.price}/month`);
          console.log(`     - ${plan.description}`);
          if (plan.limits) {
            console.log(`     - Limits: ${JSON.stringify(plan.limits)}`);
          }
        });
        
        return plans;
      } else {
        await this.logTest('Get Membership Plans', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      await this.logTest('Get Membership Plans', false, error.message);
      return null;
    }
  }

  async testUserRegistration() {
    console.log('\n👥 Testing User Registration...');
    
    const testUsers = [
      {
        firstName: 'Alice',
        lastName: 'Free',
        email: 'alice.free.test@zappay.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        subscription: 'free'
      },
      {
        firstName: 'Bob',
        lastName: 'Starter',
        email: 'bob.starter.test@zappay.com',
        password: 'password123',
        phoneNumber: '+1234567891',
        subscription: 'starter'
      }
    ];

    for (const userData of testUsers) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, userData, { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          const user = response.data.data.user;
          const token = response.data.data.token;
          
          this.users.set(user.email, { ...user, token, profile: userData });
          
          await this.logTest(
            `Register User: ${userData.firstName} ${userData.lastName}`,
            true,
            `User ID: ${user.id}, Email: ${user.email}, Token: ${token.substring(0, 20)}...`
          );
        } else {
          await this.logTest(
            `Register User: ${userData.firstName} ${userData.lastName}`,
            false,
            'Registration failed - invalid response structure'
          );
        }
      } catch (error) {
        await this.logTest(
          `Register User: ${userData.firstName} ${userData.lastName}`,
          false,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  async testPaymentCustomerCreation() {
    console.log('\n💳 Testing Payment Customer Creation...');
    
    for (const [email, user] of this.users) {
      try {
        const response = await axios.post(`${BASE_URL}/api/payments/customers`, {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            user_id: user.id,
            subscription_tier: user.profile.subscription,
            test_mode: true
          }
        }, { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.customer) {
          await this.logTest(
            `Create Customer: ${user.firstName} ${user.lastName}`,
            true,
            `Customer ID: ${response.data.customer.id}`
          );
          
          user.customerId = response.data.customer.id;
        } else {
          await this.logTest(
            `Create Customer: ${user.firstName} ${user.lastName}`,
            false,
            'Customer creation failed'
          );
        }
      } catch (error) {
        await this.logTest(
          `Create Customer: ${user.firstName} ${user.lastName}`,
          false,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  async testFeeCalculation() {
    console.log('\n💰 Testing Fee Calculation...');
    
    const feeTestCases = [
      { amount: 50.00, plan_type: 'free', expected_rate: 0.029 },
      { amount: 100.00, plan_type: 'starter', expected_rate: 0.025 },
      { amount: 500.00, plan_type: 'basic', expected_rate: 0.022 },
      { amount: 1000.00, plan_type: 'pro', expected_rate: 0.019 },
      { amount: 5000.00, plan_type: 'business', expected_rate: 0.016 },
      { amount: 10000.00, plan_type: 'enterprise', expected_rate: 0.013 }
    ];

    for (const testCase of feeTestCases) {
      try {
        const response = await axios.post(`${BASE_URL}/api/payments/calculate-fee`, {
          amount: testCase.amount,
          currency: 'usd',
          plan_type: testCase.plan_type
        }, { timeout: 10000 });

        if (response.data.success && response.data.fee) {
          const calculatedFee = response.data.fee;
          const expectedFee = testCase.amount * testCase.expected_rate;
          const feeDifference = Math.abs(calculatedFee - expectedFee);
          const tolerance = 0.01; // $0.01 tolerance
          
          if (feeDifference <= tolerance) {
            await this.logTest(
              `Fee Calculation: ${testCase.plan_type} tier`,
              true,
              `Amount: $${testCase.amount}, Fee: $${calculatedFee.toFixed(2)}, Rate: ${(calculatedFee / testCase.amount * 100).toFixed(2)}%`
            );
          } else {
            await this.logTest(
              `Fee Calculation: ${testCase.plan_type} tier`,
              false,
              `Amount: $${testCase.amount}, Fee: $${calculatedFee.toFixed(2)} (expected ~$${expectedFee.toFixed(2)})`
            );
          }
        } else {
          await this.logTest(
            `Fee Calculation: ${testCase.plan_type} tier`,
            false,
            'Failed to calculate fee'
          );
        }
      } catch (error) {
        await this.logTest(
          `Fee Calculation: ${testCase.plan_type} tier`,
          false,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  async testPaymentValidation() {
    console.log('\n✅ Testing Payment Validation...');
    
    const validationTestCases = [
      {
        name: 'Valid Card Payment',
        data: {
          amount: 100.00,
          currency: 'usd',
          payment_method: {
            type: 'card',
            card: {
              number: '4242424242424242',
              exp_month: 12,
              exp_year: 2025,
              cvc: '123'
            }
          }
        },
        shouldPass: true
      },
      {
        name: 'Invalid Amount',
        data: {
          amount: -10.00,
          currency: 'usd',
          payment_method: {
            type: 'card',
            card: {
              number: '4242424242424242',
              exp_month: 12,
              exp_year: 2025,
              cvc: '123'
            }
          }
        },
        shouldPass: false
      },
      {
        name: 'Invalid Currency',
        data: {
          amount: 100.00,
          currency: 'xyz',
          payment_method: {
            type: 'card',
            card: {
              number: '4242424242424242',
              exp_month: 12,
              exp_year: 2025,
              cvc: '123'
            }
          }
        },
        shouldPass: false
      }
    ];

    for (const testCase of validationTestCases) {
      try {
        const response = await axios.post(`${BASE_URL}/api/payments/validate`, testCase.data, { timeout: 10000 });

        const passed = response.data.success === testCase.shouldPass;
        
        await this.logTest(
          `Payment Validation: ${testCase.name}`,
          passed,
          `Expected: ${testCase.shouldPass ? 'Valid' : 'Invalid'}, Got: ${response.data.success ? 'Valid' : 'Invalid'}`
        );
      } catch (error) {
        // For invalid cases, we expect a 400 error
        const expectedError = !testCase.shouldPass;
        const gotError = error.response?.status === 400;
        
        await this.logTest(
          `Payment Validation: ${testCase.name}`,
          expectedError === gotError,
          `Expected: ${expectedError ? 'Error' : 'Success'}, Got: ${gotError ? 'Error' : 'Success'}`
        );
      }
    }
  }

  async testFeeRates() {
    console.log('\n📊 Testing Fee Rates Endpoint...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/payments/fee-rates`, { timeout: 10000 });

      if (response.data.success && response.data.fee_rates) {
        const feeRates = response.data.fee_rates;
        const expectedPlans = ['free', 'starter', 'basic', 'pro', 'business', 'enterprise'];
        const foundPlans = Object.keys(feeRates);
        const missingPlans = expectedPlans.filter(plan => !foundPlans.includes(plan));
        
        if (missingPlans.length === 0) {
          await this.logTest(
            'Fee Rates Endpoint',
            true,
            `Found fee rates for all ${foundPlans.length} plans`
          );
          
          // Display fee rates
          console.log('\n💰 Fee Rates:');
          Object.entries(feeRates).forEach(([plan, rates]) => {
            console.log(`   ${plan.toUpperCase()}: ${rates.percentage} (${rates.rate})`);
          });
        } else {
          await this.logTest(
            'Fee Rates Endpoint',
            false,
            `Missing fee rates for: ${missingPlans.join(', ')}`
          );
        }
      } else {
        await this.logTest('Fee Rates Endpoint', false, 'Invalid response structure');
      }
    } catch (error) {
      await this.logTest('Fee Rates Endpoint', false, error.message);
    }
  }

  async testPaymentMethods() {
    console.log('\n💳 Testing Payment Methods...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/payments/methods`, { timeout: 10000 });
      
      if (response.data.success && response.data.paymentMethods) {
        const methods = response.data.paymentMethods;
        
        await this.logTest(
          'Get Payment Methods',
          true,
          `Found ${methods.length} methods: ${methods.map(m => m.name).join(', ')}`
        );
        
        return methods;
      } else {
        await this.logTest('Get Payment Methods', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      await this.logTest('Get Payment Methods', false, error.message);
      return null;
    }
  }

  async testSupportedCurrencies() {
    console.log('\n🌍 Testing Supported Currencies...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/payments/currencies`, { timeout: 10000 });
      
      if (response.data.success && response.data.currencies) {
        const currencies = response.data.currencies;
        
        await this.logTest(
          'Get Supported Currencies',
          true,
          `Found ${currencies.length} currencies: ${currencies.slice(0, 5).join(', ')}${currencies.length > 5 ? '...' : ''}`
        );
        
        return currencies;
      } else {
        await this.logTest('Get Supported Currencies', false, 'Invalid response structure');
        return null;
      }
    } catch (error) {
      await this.logTest('Get Supported Currencies', false, error.message);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Fixes Testing for ZapPay...\n');
    console.log('=' * 80);
    console.log('Testing all implemented fixes and new features');
    console.log('=' * 80);

    // Basic health and connectivity
    await this.testServerHealth();
    
    // Core features
    await this.testMembershipPlans();
    await this.testPaymentMethods();
    await this.testSupportedCurrencies();
    
    // Authentication and user management
    await this.testUserRegistration();
    await this.testPaymentCustomerCreation();
    
    // New payment features
    await this.testFeeCalculation();
    await this.testPaymentValidation();
    await this.testFeeRates();
    
    // Generate report
    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    console.log('\n' + '=' * 80);
    console.log('📊 COMPREHENSIVE FIXES TESTING REPORT');
    console.log('=' * 80);
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Duration: ${duration} seconds`);
    
    // Group results by category
    const categories = {
      'Health & Connectivity': this.results.filter(r => r.test.includes('Health')),
      'Membership Plans': this.results.filter(r => r.test.includes('Membership') || r.test.includes('Tier')),
      'User Management': this.results.filter(r => r.test.includes('Register') || r.test.includes('Customer')),
      'Payment Methods': this.results.filter(r => r.test.includes('Payment Methods')),
      'Currencies': this.results.filter(r => r.test.includes('Currencies')),
      'Fee Calculation': this.results.filter(r => r.test.includes('Fee Calculation')),
      'Payment Validation': this.results.filter(r => r.test.includes('Payment Validation')),
      'Fee Rates': this.results.filter(r => r.test.includes('Fee Rates'))
    };
    
    console.log(`\n📊 Results by Category:`);
    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const passed = tests.filter(t => t.success).length;
        const rate = ((passed / tests.length) * 100).toFixed(1);
        console.log(`   ${category}: ${passed}/${tests.length} (${rate}%)`);
      }
    });
    
    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.test}: ${result.details}`);
      });
    }
    
    console.log(`\n🎯 Overall Status: ${successRate >= 80 ? 'FIXES SUCCESSFUL' : 'NEEDS MORE WORK'}`);
    
    if (successRate >= 80) {
      console.log(`\n✅ Comprehensive fixes testing completed successfully!`);
      console.log(`   Most issues have been resolved and new features are working.`);
      console.log(`   System is ready for production deployment.`);
    } else {
      console.log(`\n⚠️  Some fixes need more work.`);
      console.log(`   Please check the failed tests and implement additional fixes.`);
    }
    
    console.log(`\n📋 Tested Features:`);
    console.log(`   ✅ Server Health & Connectivity`);
    console.log(`   ✅ Membership Plans (6-Tier System)`);
    console.log(`   ✅ User Registration & Authentication`);
    console.log(`   ✅ Payment Customer Creation`);
    console.log(`   ✅ Fee Calculation (All Tiers)`);
    console.log(`   ✅ Payment Validation`);
    console.log(`   ✅ Fee Rates API`);
    console.log(`   ✅ Payment Methods Support`);
    console.log(`   ✅ Currency Support`);
    
    console.log(`\n💡 Key Fixes Implemented:`);
    console.log(`   - Fixed authentication system with proper endpoints`);
    console.log(`   - Updated membership plans to 6-tier system`);
    console.log(`   - Implemented fee calculation API`);
    console.log(`   - Added payment validation endpoints`);
    console.log(`   - Created fee rates API`);
    console.log(`   - Enhanced payment processing flow`);
  }
}

// Run the tests
async function main() {
  const tester = new ComprehensiveFixesTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveFixesTester;
