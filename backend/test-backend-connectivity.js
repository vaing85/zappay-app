// Test backend connectivity and routing
const https = require('https');

console.log('🔍 Testing Backend Connectivity...\n');

// Test different possible backend URLs
const testUrls = [
  'https://zappay.site/api/health',
  'https://zappay.site/health', 
  'https://zappay.site/api/test',
  'https://zappay.site/api/status'
];

const testUrl = (url) => {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Test/1.0',
        'Accept': 'application/json'
      }
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
        console.log(`  Response Type: ${isJson ? 'JSON' : isHtml ? 'HTML' : 'Other'}`);
        console.log(`  Response Length: ${data.length} characters`);
        
        if (isJson) {
          console.log(`  ✅ JSON Response: ${data.substring(0, 100)}...`);
        } else if (isHtml) {
          console.log(`  ⚠️ HTML Response (Frontend serving this route)`);
        } else {
          console.log(`  📄 Other Response: ${data.substring(0, 100)}...`);
        }
        
        console.log('');
        resolve({ url, status: res.statusCode, isJson, isHtml, data });
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
      resolve({ url, error: error.message });
    });

    req.setTimeout(5000, () => {
      console.log(`  ⏰ Timeout`);
      console.log('');
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });

    req.end();
  });
};

// Run all tests
const runTests = async () => {
  console.log('Testing multiple endpoints to identify the issue...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('🔍 Analysis:');
  console.log('- If all responses are HTML, the frontend is serving all routes');
  console.log('- If some are JSON, the backend is working but routing is mixed');
  console.log('- If all are errors, the backend is not accessible');
  console.log('- If some are timeouts, there might be network issues');
};

runTests();
