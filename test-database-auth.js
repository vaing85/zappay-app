#!/usr/bin/env node

/**
 * Test Real Database Authentication System
 */

const https = require('https');

const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZapPay-DB-Auth-Test/1.0',
        ...options.headers
      },
      timeout: 15000
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testDatabaseAuthentication() {
  console.log('🔍 Testing Real Database Authentication System...');
  console.log('=' .repeat(60));
  
  // Test 1: Real database registration
  console.log('\n1️⃣ Testing Real Database Registration...');
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@testdb.com',
    phoneNumber: '1234567890',
    password: 'testpassword123'
  };
  
  try {
    const registerResponse = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    console.log(`   Status: ${registerResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(registerResponse.data, null, 2)}`);
    
    if (registerResponse.statusCode === 200 || registerResponse.statusCode === 201) {
      console.log('   ✅ Real database registration successful');
      
      // Test 2: Real database login with registered user
      console.log('\n2️⃣ Testing Real Database Login...');
      try {
        const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          body: {
            email: testUser.email,
            password: testUser.password
          }
        });
        
        console.log(`   Status: ${loginResponse.statusCode}`);
        console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
        
        if (loginResponse.statusCode === 200) {
          console.log('   ✅ Real database login successful');
          console.log('   🎉 DATABASE AUTHENTICATION IS WORKING!');
          return true;
        } else {
          console.log('   ❌ Real database login failed');
          return false;
        }
      } catch (error) {
        console.log('   ❌ Real database login error:', error.message);
        return false;
      }
    } else {
      console.log('   ❌ Real database registration failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Real database registration error:', error.message);
    return false;
  }
}

async function testExistingUserLogin() {
  console.log('\n3️⃣ Testing Existing User Login...');
  try {
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
    if (loginResponse.statusCode === 200) {
      console.log('   ✅ Existing user login successful');
      return true;
    } else {
      console.log('   ❌ Existing user login failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Existing user login error:', error.message);
    return false;
  }
}

async function testInvalidCredentials() {
  console.log('\n4️⃣ Testing Invalid Credentials Handling...');
  try {
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }
    });
    
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
    if (loginResponse.statusCode === 401 || loginResponse.statusCode === 400) {
      console.log('   ✅ Invalid credentials properly rejected');
      return true;
    } else {
      console.log('   ❌ Should have rejected invalid credentials');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Invalid credentials test error:', error.message);
    return false;
  }
}

async function runDatabaseAuthTests() {
  console.log('🚀 Starting Database Authentication Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    databaseRegistration: false,
    databaseLogin: false,
    existingUserLogin: false,
    invalidCredentials: false
  };
  
  // Test real database authentication
  results.databaseRegistration = await testDatabaseAuthentication();
  
  // Test existing user login
  results.existingUserLogin = await testExistingUserLogin();
  
  // Test invalid credentials
  results.invalidCredentials = await testInvalidCredentials();
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DATABASE AUTHENTICATION TEST RESULTS');
  console.log('=' .repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`Database Registration: ${results.databaseRegistration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Login: ${results.databaseLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Existing User Login: ${results.existingUserLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Credentials: ${results.invalidCredentials ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 DATABASE AUTHENTICATION IS FULLY WORKING!');
    console.log('✅ Users can register and login with real database');
    console.log('✅ Error handling is working correctly');
    console.log('✅ System is ready for production users');
  } else {
    console.log('⚠️  Some database authentication tests failed.');
    console.log('🔧 Check the details above for specific issues.');
  }
  
  console.log('=' .repeat(60));
}

runDatabaseAuthTests().catch(console.error);
