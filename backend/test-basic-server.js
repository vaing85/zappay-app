const https = require('https');

const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

console.log('Testing basic server...');
console.log('URL:', BACKEND_URL);

const req = https.request(`${BACKEND_URL}/health`, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! Server is working!');
    } else {
      console.log('❌ FAILED! Status:', res.statusCode);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ ERROR:', err.message);
});

req.end();
