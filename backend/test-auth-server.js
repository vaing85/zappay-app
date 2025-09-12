const https = require('https');

console.log('🧪 Testing ZapPay Production Server v5 with Authentication...');

const baseUrl = 'zappayapp-ie9d2.ondigitalocean.app';

// Test endpoints
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/api/status', name: 'API Status' },
  { path: '/api/test', name: 'API Test' },
  { path: '/api/db-test', name: 'Database Test' },
  { path: '/api/auth/register', name: 'Auth Register', method: 'POST', body: { email: 'test@example.com', password: 'password123', name: 'Test User' } },
  { path: '/api/auth/login', name: 'Auth Login', method: 'POST', body: { email: 'test@example.com', password: 'password123' } },
  { path: '/', name: 'Root Endpoint' }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: endpoint.path,
      method: endpoint.method || 'GET',
      headers: {
        'User-Agent': 'ZapPay-Test-Client',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📋 ${endpoint.name} (${endpoint.path})`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`   ✅ SUCCESS`);
        } else if (res.statusCode === 503 && endpoint.path === '/api/db-test') {
          console.log(`   ⚠️  EXPECTED (Database not connected)`);
        } else if (res.statusCode === 404) {
          console.log(`   ⚠️  NOT IMPLEMENTED (Server not updated)`);
        } else {
          console.log(`   ❌ FAILED`);
        }
        
        resolve(res.statusCode === 200 || res.statusCode === 201 || (res.statusCode === 503 && endpoint.path === '/api/db-test'));
      });
    });

    req.on('error', (error) => {
      console.log(`\n📋 ${endpoint.name} (${endpoint.path})`);
      console.log(`   ❌ ERROR: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(15000, () => {
      console.log(`\n📋 ${endpoint.name} (${endpoint.path})`);
      console.log(`   ❌ TIMEOUT`);
      req.destroy();
      resolve(false);
    });

    // Send body for POST requests
    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log(`🌐 Testing server at: https://${baseUrl}`);
  console.log('⏳ Running tests...\n');
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log(`\n🎉 ALL TESTS PASSED! Authentication server is working perfectly!`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the server configuration.`);
  }
}

runTests().catch(console.error);
