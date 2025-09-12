#!/usr/bin/env node

/**
 * Quick CORS Test for ZapPay Production
 * Tests CORS configuration between frontend and backend
 */

const https = require('https');

const FRONTEND_URL = 'https://zappay.site';
const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testCORS() {
  console.log('🔍 Testing CORS Configuration...');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('');

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET',
          'User-Agent': 'ZapPay-CORS-Test/1.0'
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
      req.setTimeout(5000, () => reject(new Error('Request timeout')));
      req.end();
    });

    console.log(`Status Code: ${response.statusCode}`);
    console.log('');
    console.log('CORS Headers:');
    console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NOT SET'}`);
    console.log(`  Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NOT SET'}`);
    console.log(`  Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NOT SET'}`);
    console.log(`  Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'NOT SET'}`);
    
    console.log('');
    console.log('Other Headers:');
    console.log(`  Content-Type: ${response.headers['content-type'] || 'NOT SET'}`);
    console.log(`  Server: ${response.headers['server'] || 'NOT SET'}`);
    
    if (response.statusCode === 200) {
      console.log('');
      console.log('✅ Backend is responding!');
      
      if (response.headers['access-control-allow-origin']) {
        console.log('✅ CORS headers are present');
        
        if (response.headers['access-control-allow-origin'].includes('zappay.site')) {
          console.log('✅ CORS is configured for zappay.site');
        } else {
          console.log('❌ CORS is not configured for zappay.site');
          console.log(`   Current origin: ${response.headers['access-control-allow-origin']}`);
        }
      } else {
        console.log('❌ CORS headers are missing');
      }
    } else {
      console.log(`❌ Backend returned status ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('   This might indicate the backend is still starting up.');
      console.log('   Please wait a few minutes and try again.');
    }
  }
}

testCORS();
