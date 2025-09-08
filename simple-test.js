// Simple integration test
const https = require('https');

console.log('Testing ZapPay Integration...');

// Test backend health
const options = {
  hostname: 'zappayapp-ie9d2.ondigitalocean.app',
  port: 443,
  path: '/health',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Backend is healthy!');
      console.log('Response:', result);
    } catch (e) {
      console.log('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Request failed:', e.message);
});

req.end();
