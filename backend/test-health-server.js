const https = require('https');

console.log('Testing health server...');

const options = {
  hostname: 'zappayapp-ie9d2.ondigitalocean.app',
  port: 443,
  path: '/health',
  method: 'GET',
  headers: {
    'User-Agent': 'ZapPay-Test-Client'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response: ${data}`);
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! Health server is working!');
    } else {
      console.log('❌ FAILED! Health server not working');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
