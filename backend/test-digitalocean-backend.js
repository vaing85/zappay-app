// Simple test for DigitalOcean backend
const https = require('https');

console.log('🔍 Testing DigitalOcean Backend...\n');

// Test the backend health endpoint
const testBackend = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'zappay-backend-api-nyc1.ondigitalocean.app',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'User-Agent': 'ZapPay-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        console.log(`📄 Response:`, data);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('✅ Backend is responding with JSON');
            resolve({ success: true, data: jsonData });
          } catch (e) {
            console.log('⚠️ Backend responded but not with JSON');
            resolve({ success: false, error: 'Not JSON response' });
          }
        } else {
          console.log('❌ Backend returned non-200 status');
          resolve({ success: false, error: `Status ${res.statusCode}` });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Backend connection failed:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log('⏰ Backend request timed out');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
};

// Run the test
testBackend().then((result) => {
  if (result.success) {
    console.log('\n🎉 DigitalOcean backend is working!');
  } else {
    console.log('\n❌ DigitalOcean backend has issues:', result.error);
  }
});
