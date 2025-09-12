#!/usr/bin/env node

/**
 * Test Health Check Direct
 * Tests health endpoint with detailed error reporting
 */

const https = require('https');

const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testHealthDirect() {
  console.log('🔍 Testing Health Check Direct...');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('');

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ZapPay-Health-Test/1.0',
          'Accept': 'text/plain, application/json, */*'
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
      req.setTimeout(15000, () => reject(new Error('Request timeout')));
      req.end();
    });

    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Content-Length: ${response.headers['content-length']}`);
    console.log('');
    console.log('Response Body:');
    console.log(response.data);

    if (response.statusCode === 200) {
      console.log('');
      console.log('✅ Health check is working!');
    } else {
      console.log('');
      console.log(`❌ Health check returned status: ${response.statusCode}`);
    }

  } catch (error) {
    console.log('');
    console.log(`❌ Request failed: ${error.message}`);
    
    if (error.message.includes('504')) {
      console.log('💡 504 Gateway Timeout - DigitalOcean load balancer issue');
    } else if (error.message.includes('503')) {
      console.log('💡 503 Service Unavailable - App is unhealthy');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Request timeout - Server not responding');
    }
  }
}

testHealthDirect();
