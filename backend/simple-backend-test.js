#!/usr/bin/env node

const https = require('https');

const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testBackend() {
  console.log('🔍 Testing Backend Status...');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('');

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ZapPay-Test/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });

    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log('');
    
    if (response.data) {
      console.log('Response Body:');
      try {
        const jsonData = JSON.parse(response.data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(response.data);
      }
    }
    
    if (response.statusCode === 200) {
      console.log('');
      console.log('✅ Backend is working!');
    } else {
      console.log('');
      console.log(`❌ Backend returned error status: ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testBackend();
