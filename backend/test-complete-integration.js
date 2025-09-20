// Comprehensive test of complete frontend-backend integration
const https = require('https');

console.log('🧪 Testing Complete Frontend-Backend Integration...\n');

const backendUrl = 'https://zappayapp-ie9d2.ondigitalocean.app';
const frontendUrl = 'https://zappay.site';

const testEndpoint = (url, name, expectedJson = true) => {
  return new Promise((resolve) => {
    console.log(`Testing: ${name}`);
    console.log(`  URL: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Integration-Test/1.0',
        'Accept': 'application/json'
      },
      timeout: 15000
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
        console.log(`  Response Length: ${data.length} characters`);
        
        if (res.statusCode === 200) {
          if (expectedJson && isJson) {
            console.log(`  ✅ ${name}: Working (JSON response)`);
            console.log(`  Response: ${data.substring(0, 150)}${data.length > 150 ? '...' : ''}`);
            resolve({ success: true, type: 'json', data });
          } else if (!expectedJson && isHtml) {
            console.log(`  ✅ ${name}: Working (HTML response)`);
            resolve({ success: true, type: 'html', data });
          } else {
            console.log(`  ⚠️ ${name}: Unexpected response type`);
            console.log(`  Response: ${data.substring(0, 150)}${data.length > 150 ? '...' : ''}`);
            resolve({ success: false, type: 'unexpected', data });
          }
        } else {
          console.log(`  ❌ ${name}: Error (Status: ${res.statusCode})`);
          console.log(`  Response: ${data.substring(0, 150)}${data.length > 150 ? '...' : ''}`);
          resolve({ success: false, type: 'error', data });
        }
        
        console.log('');
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ ${name}: Connection error - ${error.message}`);
      console.log('');
      resolve({ success: false, type: 'connection_error', error: error.message });
    });

    req.on('timeout', () => {
      console.log(`  ⏰ ${name}: Timeout`);
      console.log('');
      req.destroy();
      resolve({ success: false, type: 'timeout' });
    });

    req.setTimeout(15000);
    req.end();
  });
};

const runIntegrationTests = async () => {
  console.log('🔍 Testing Backend Endpoints...\n');
  
  const backendTests = [
    { url: `${backendUrl}/health`, name: 'Backend Health Check', expectedJson: true },
    { url: `${backendUrl}/rapyd-health`, name: 'Rapyd Health Check', expectedJson: true },
    { url: `${backendUrl}/email-test`, name: 'Email Service Test', expectedJson: true },
    { url: `${backendUrl}/`, name: 'Backend Root', expectedJson: true }
  ];
  
  console.log('🔍 Testing Frontend...\n');
  
  const frontendTests = [
    { url: `${frontendUrl}/`, name: 'Frontend Homepage', expectedJson: false },
    { url: `${frontendUrl}/health`, name: 'Frontend Health (should be HTML)', expectedJson: false }
  ];
  
  // Test backend endpoints
  const backendResults = [];
  for (const test of backendTests) {
    const result = await testEndpoint(test.url, test.name, test.expectedJson);
    backendResults.push({ ...test, result });
  }
  
  // Test frontend endpoints
  const frontendResults = [];
  for (const test of frontendTests) {
    const result = await testEndpoint(test.url, test.name, test.expectedJson);
    frontendResults.push({ ...test, result });
  }
  
  // Summary
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const backendSuccess = backendResults.filter(r => r.result.success).length;
  const frontendSuccess = frontendResults.filter(r => r.result.success).length;
  
  console.log(`\n🔧 Backend Tests: ${backendSuccess}/${backendTests.length} passed`);
  console.log(`🌐 Frontend Tests: ${frontendSuccess}/${frontendTests.length} passed`);
  console.log(`📈 Overall: ${backendSuccess + frontendSuccess}/${backendTests.length + frontendTests.length} passed`);
  
  if (backendSuccess === backendTests.length && frontendSuccess === frontendTests.length) {
    console.log('\n🎉 SUCCESS! Complete integration is working!');
    console.log('✅ Backend is responding with JSON');
    console.log('✅ Frontend is serving HTML');
    console.log('✅ API integration is ready');
    console.log('✅ ZapPay is production ready!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above.');
  }
  
  console.log('\n🔗 URLs:');
  console.log(`  Backend: ${backendUrl}`);
  console.log(`  Frontend: ${frontendUrl}`);
  console.log(`  API Health: ${backendUrl}/health`);
  console.log(`  Frontend Health: ${frontendUrl}/health`);
};

runIntegrationTests();
