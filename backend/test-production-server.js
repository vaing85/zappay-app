const https = require('https');

console.log('🧪 Testing ZapPay Production Server...');

const baseUrl = 'zappayapp-ie9d2.ondigitalocean.app';

// Test endpoints
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/api/status', name: 'API Status' },
  { path: '/api/test', name: 'API Test' },
  { path: '/', name: 'Root Endpoint' }
];

async function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Test-Client',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📋 ${name} (${path})`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS`);
        } else {
          console.log(`   ❌ FAILED`);
        }
        
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (error) => {
      console.log(`\n📋 ${name} (${path})`);
      console.log(`   ❌ ERROR: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log(`\n📋 ${name} (${path})`);
      console.log(`   ❌ TIMEOUT`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log(`🌐 Testing server at: https://${baseUrl}`);
  console.log('⏳ Running tests...\n');
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.path, endpoint.name);
    if (success) passed++;
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log(`\n🎉 ALL TESTS PASSED! Production server is working perfectly!`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the server configuration.`);
  }
}

runTests().catch(console.error);
