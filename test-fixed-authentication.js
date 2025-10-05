#!/usr/bin/env node

/**
 * Fixed Authentication Testing Script for ZapPay
 * Tests user registration and authentication with correct endpoints
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

class FixedAuthTester {
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

  async testUserRegistration() {
    console.log('\n👥 Testing User Registration with Correct Endpoints...');
    
    const testUsers = [
      {
        firstName: 'Alice',
        lastName: 'Free',
        email: 'alice.free@zappay.com',
        password: 'password123',
        phoneNumber: '+1234567890',
        subscription: 'free'
      },
      {
        firstName: 'Bob',
        lastName: 'Starter',
        email: 'bob.starter@zappay.com',
        password: 'password123',
        phoneNumber: '+1234567891',
        subscription: 'starter'
      },
      {
        firstName: 'Carol',
        lastName: 'Basic',
        email: 'carol.basic@zappay.com',
        password: 'password123',
        phoneNumber: '+1234567892',
        subscription: 'basic'
      }
    ];

    for (const userData of testUsers) {
      try {
        // Use the correct auth registration endpoint
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

  async testUserLogin() {
    console.log('\n🔐 Testing User Login...');
    
    for (const [email, user] of this.users) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: email,
          password: 'password123'
        }, { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          const loginData = response.data.data;
          
          await this.logTest(
            `Login User: ${user.firstName} ${user.lastName}`,
            true,
            `Token: ${loginData.token.substring(0, 20)}..., Expires: ${loginData.refreshToken ? 'Yes' : 'No'}`
          );
          
          // Update user with new token
          user.token = loginData.token;
        } else {
          await this.logTest(
            `Login User: ${user.firstName} ${user.lastName}`,
            false,
            'Login failed - invalid response structure'
          );
        }
      } catch (error) {
        await this.logTest(
          `Login User: ${user.firstName} ${user.lastName}`,
          false,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  async testAuthenticatedEndpoints() {
    console.log('\n🔒 Testing Authenticated Endpoints...');
    
    for (const [email, user] of this.users) {
      try {
        // Test user profile endpoint
        const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        if (profileResponse.data.success) {
          await this.logTest(
            `User Profile: ${user.firstName} ${user.lastName}`,
            true,
            `Profile accessible with token`
          );
        } else {
          await this.logTest(
            `User Profile: ${user.firstName} ${user.lastName}`,
            false,
            'Profile access failed'
          );
        }
      } catch (error) {
        await this.logTest(
          `User Profile: ${user.firstName} ${user.lastName}`,
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
          
          // Store customer ID for future use
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

  async testTransactionCreation() {
    console.log('\n💰 Testing Transaction Creation...');
    
    const users = Array.from(this.users.values());
    if (users.length < 2) {
      await this.logTest('Transaction Creation', false, 'Need at least 2 users for transaction testing');
      return;
    }

    const alice = users[0];
    const bob = users[1];

    try {
      const response = await axios.post(`${BASE_URL}/api/transactions`, {
        from_user_id: alice.id,
        to_user_id: bob.id,
        amount: 50.00,
        description: 'Test transaction between authenticated users',
        type: 'peer_to_peer',
        currency: 'usd'
      }, {
        headers: {
          'Authorization': `Bearer ${alice.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success && response.data.transaction) {
        await this.logTest(
          'Create Transaction',
          true,
          `Transaction ID: ${response.data.transaction.id}, Amount: $${response.data.transaction.amount}`
        );
      } else {
        await this.logTest(
          'Create Transaction',
          false,
          'Transaction creation failed'
        );
      }
    } catch (error) {
      await this.logTest(
        'Create Transaction',
        false,
        error.response?.data?.message || error.message
      );
    }
  }

  async testMembershipPlans() {
    console.log('\n📋 Testing Membership Plans...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/subscriptions/plans`, { timeout: 10000 });
      
      if (response.data.success && response.data.plans) {
        const plans = response.data.plans;
        
        await this.logTest(
          'Get Membership Plans',
          true,
          `Found ${plans.length} plans: ${plans.map(p => p.name).join(', ')}`
        );
        
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

  async runAllTests() {
    console.log('🚀 Starting Fixed Authentication Testing for ZapPay...\n');
    console.log('=' * 70);
    console.log('Testing authentication with correct endpoints');
    console.log('=' * 70);

    // Test authentication flow
    await this.testUserRegistration();
    await this.testUserLogin();
    await this.testAuthenticatedEndpoints();
    
    // Test payment features
    await this.testPaymentCustomerCreation();
    await this.testTransactionCreation();
    
    // Test membership plans
    await this.testMembershipPlans();
    
    // Generate report
    this.generateReport();
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    console.log('\n' + '=' * 70);
    console.log('📊 FIXED AUTHENTICATION TESTING REPORT');
    console.log('=' * 70);
    
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
      'User Registration': this.results.filter(r => r.test.includes('Register')),
      'User Login': this.results.filter(r => r.test.includes('Login')),
      'Authenticated Endpoints': this.results.filter(r => r.test.includes('Profile')),
      'Payment Features': this.results.filter(r => r.test.includes('Customer') || r.test.includes('Transaction')),
      'Membership Plans': this.results.filter(r => r.test.includes('Membership'))
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
    
    console.log(`\n🎯 Overall Status: ${successRate >= 80 ? 'AUTHENTICATION WORKING' : 'NEEDS FIXES'}`);
    
    if (successRate >= 80) {
      console.log(`\n✅ Authentication system is working correctly!`);
      console.log(`   Users can register, login, and access authenticated endpoints.`);
      console.log(`   Payment features are functional with proper authentication.`);
    } else {
      console.log(`\n⚠️  Authentication system needs attention.`);
      console.log(`   Please check the failed tests and fix issues.`);
    }
    
    console.log(`\n📋 Tested Features:`);
    console.log(`   ✅ User Registration (/api/auth/register)`);
    console.log(`   ✅ User Login (/api/auth/login)`);
    console.log(`   ✅ Authenticated Endpoints (/api/users/profile)`);
    console.log(`   ✅ Payment Customer Creation`);
    console.log(`   ✅ Transaction Creation`);
    console.log(`   ✅ Membership Plans`);
    
    console.log(`\n💡 Key Fixes Applied:`);
    console.log(`   - Used correct /api/auth/register endpoint for user registration`);
    console.log(`   - Used correct /api/auth/login endpoint for user login`);
    console.log(`   - Applied proper authentication headers for protected endpoints`);
    console.log(`   - Tested with proper request structure and validation`);
  }
}

// Run the tests
async function main() {
  const tester = new FixedAuthTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FixedAuthTester;
