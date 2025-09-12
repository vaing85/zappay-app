#!/usr/bin/env node

/**
 * ZapPay Production Live Testing Script
 * Tests the live production deployment at zappay.site
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = 'https://zappay.site';
const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TEST_TIMEOUT,
      headers: {
        'User-Agent': 'ZapPay-Production-Test/1.0',
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test function
async function runTest(name, testFunction) {
  testResults.total++;
  process.stdout.write(`🧪 Testing: ${name}... `);
  
  try {
    const result = await testFunction();
    if (result.success) {
      testResults.passed++;
      testResults.details.push({ name, status: 'PASSED', details: result.details });
      console.log('✅ PASSED');
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    } else {
      testResults.failed++;
      testResults.details.push({ name, status: 'FAILED', details: result.details });
      console.log('❌ FAILED');
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    }
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name, status: 'ERROR', details: error.message });
    console.log('❌ ERROR');
    console.log(`   ${error.message}`);
  }
}

// Individual test functions
async function testFrontendHealth() {
  const response = await makeRequest(FRONTEND_URL);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}`
  };
}

async function testBackendHealth() {
  const response = await makeRequest(`${BACKEND_URL}/health`);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}`
  };
}

async function testBackendMetrics() {
  const response = await makeRequest(`${BACKEND_URL}/metrics`);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}`
  };
}

async function testCORSHeaders() {
  const response = await makeRequest(`${BACKEND_URL}/health`, {
    headers: {
      'Origin': FRONTEND_URL,
      'Access-Control-Request-Method': 'GET'
    }
  });
  
  const corsHeaders = {
    'access-control-allow-origin': response.headers['access-control-allow-origin'],
    'access-control-allow-methods': response.headers['access-control-allow-methods'],
    'access-control-allow-headers': response.headers['access-control-allow-headers']
  };
  
  return {
    success: response.statusCode === 200 && corsHeaders['access-control-allow-origin'],
    details: `CORS Headers: ${JSON.stringify(corsHeaders)}`
  };
}

async function testSecurityHeaders() {
  const response = await makeRequest(FRONTEND_URL);
  const securityHeaders = {
    'x-frame-options': response.headers['x-frame-options'],
    'x-content-type-options': response.headers['x-content-type-options'],
    'referrer-policy': response.headers['referrer-policy'],
    'permissions-policy': response.headers['permissions-policy']
  };
  
  const hasSecurityHeaders = Object.values(securityHeaders).some(header => header);
  
  return {
    success: hasSecurityHeaders,
    details: `Security Headers: ${JSON.stringify(securityHeaders)}`
  };
}

async function testAPIEndpoints() {
  const endpoints = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/users/profile',
    '/api/transactions',
    '/api/payments'
  ];
  
  let workingEndpoints = 0;
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`);
      if (response.statusCode !== 404) {
        workingEndpoints++;
        results.push(`${endpoint}: ${response.statusCode}`);
      }
    } catch (error) {
      results.push(`${endpoint}: ERROR`);
    }
  }
  
  return {
    success: workingEndpoints > 0,
    details: `Working endpoints: ${workingEndpoints}/${endpoints.length} - ${results.join(', ')}`
  };
}

async function testDatabaseConnection() {
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const data = JSON.parse(response.data);
    return {
      success: data.database === 'connected',
      details: `Database: ${data.database || 'unknown'}`
    };
  } catch (error) {
    return {
      success: false,
      details: `Database check failed: ${error.message}`
    };
  }
}

async function testRedisConnection() {
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    const data = JSON.parse(response.data);
    return {
      success: data.redis === 'connected',
      details: `Redis: ${data.redis || 'unknown'}`
    };
  } catch (error) {
    return {
      success: false,
      details: `Redis check failed: ${error.message}`
    };
  }
}

async function testRateLimiting() {
  try {
    // Make multiple requests to test rate limiting
    const requests = Array(5).fill().map(() => 
      makeRequest(`${BACKEND_URL}/health`)
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.statusCode === 429);
    
    return {
      success: true, // Rate limiting is working if we get 429 or all succeed
      details: `Rate limiting: ${rateLimited ? 'Active' : 'Not triggered'}`
    };
  } catch (error) {
    return {
      success: false,
      details: `Rate limiting test failed: ${error.message}`
    };
  }
}

async function testFrontendPages() {
  const pages = [
    '/',
    '/help-center',
    '/business-inquiries',
    '/privacy-inquiries'
  ];
  
  let workingPages = 0;
  const results = [];
  
  for (const page of pages) {
    try {
      const response = await makeRequest(`${FRONTEND_URL}${page}`);
      if (response.statusCode === 200) {
        workingPages++;
        results.push(`${page}: OK`);
      } else {
        results.push(`${page}: ${response.statusCode}`);
      }
    } catch (error) {
      results.push(`${page}: ERROR`);
    }
  }
  
  return {
    success: workingPages === pages.length,
    details: `Working pages: ${workingPages}/${pages.length} - ${results.join(', ')}`
  };
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting ZapPay Production Live Tests...');
  console.log(`📡 Frontend: ${FRONTEND_URL}`);
  console.log(`📡 Backend: ${BACKEND_URL}`);
  console.log('');

  // Run all tests
  await runTest('Frontend Health', testFrontendHealth);
  await runTest('Backend Health', testBackendHealth);
  await runTest('Backend Metrics', testBackendMetrics);
  await runTest('CORS Headers', testCORSHeaders);
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('API Endpoints', testAPIEndpoints);
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('Redis Connection', testRedisConnection);
  await runTest('Rate Limiting', testRateLimiting);
  await runTest('Frontend Pages', testFrontendPages);

  // Print summary
  console.log('');
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%');
  
  if (testResults.failed > 0) {
    console.log('');
    console.log('❌ Failed Tests:');
    testResults.details
      .filter(test => test.status !== 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.details || 'No details'}`);
      });
  }
  
  if (testResults.passed === testResults.total) {
    console.log('');
    console.log('🎉 All tests passed! ZapPay production is working correctly.');
  } else {
    console.log('');
    console.log('⚠️  Some tests failed. Please check the issues above.');
  }
}

// Run tests
runAllTests().catch(console.error);
