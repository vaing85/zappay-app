// Test all possible backend endpoints
const https = require('https');

console.log('🔍 Testing DigitalOcean Backend Endpoints...\n');
console.log('Backend URL: https://zappayapp-ie9d2.ondigitalocean.app/\n');

// Test different endpoints
const testEndpoints = [
  '/',
  '/health',
  '/api/health', 
  '/api/test',
  '/api/status',
  '/test',
  '/status',
  '/rapyd-health',
  '/email-test',
  '/sms-test'
];

const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const url = `https://zappayapp-ie9d2.ondigitalocean.app${endpoint}`;
    console.log(`Testing: ${endpoint}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Test/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isJson = data.trim().startsWith('{') || data.trim().startsWith('[');
        const isHtml = data.includes('<!doctype html>') || data.includes('<html');
        
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Content-Type: ${res.headers['content-type'] || 'Not set'}`);
        console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        
        if (res.statusCode === 200 && isJson) {
          console.log(`  ✅ Working endpoint!`);
        } else if (res.statusCode === 404) {
          console.log(`  ❌ Not found`);
        } else if (res.statusCode === 500) {
          console.log(`  💥 Server error`);
        } else if (res.statusCode === 504) {
          console.log(`  ⏰ Gateway timeout`);
        } else {
          console.log(`  ⚠️ Unexpected status`);
        }
        
        console.log('');
        resolve({ endpoint, status: res.statusCode, data, isJson });
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
      resolve({ endpoint, error: error.message });
    });

    req.on('timeout', () => {
      console.log(`  ⏰ Timeout`);
      console.log('');
      req.destroy();
      resolve({ endpoint, error: 'Timeout' });
    });

    req.setTimeout(10000);
    req.end();
  });
};

// Run all tests
const runTests = async () => {
  console.log('Testing all possible endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('🔍 Summary:');
  console.log('- Look for endpoints that return 200 status with JSON');
  console.log('- 404 means the endpoint doesn\'t exist');
  console.log('- 504 means the endpoint exists but is timing out');
  console.log('- 500 means there\'s a server error');
};

runTests();
