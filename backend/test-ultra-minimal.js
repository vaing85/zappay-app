#!/usr/bin/env node

/**
 * Test Ultra Minimal Server
 * Tests the ultra-minimal server deployment
 */

const https = require('https');

const BACKEND_URL = 'https://zappayapp-ie9d2.ondigitalocean.app';

async function testUltraMinimalServer() {
  console.log('🔍 Testing Ultra Minimal Server...');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log('');

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ZapPay-Ultra-Minimal-Test/1.0'
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
    console.log('');
    console.log('Response Body:');
    console.log(response.data);

    if (response.statusCode === 200) {
      console.log('');
      console.log('✅ Ultra minimal server is working!');
      
      // Try to parse JSON response
      try {
        const jsonData = JSON.parse(response.data);
        console.log('📊 Server Info:');
        console.log(`   Status: ${jsonData.status}`);
        console.log(`   Environment: ${jsonData.environment}`);
        console.log(`   Port: ${jsonData.port}`);
        console.log(`   Uptime: ${jsonData.uptime}s`);
        console.log(`   Message: ${jsonData.message}`);
      } catch (e) {
        console.log('⚠️  Response is not valid JSON');
      }
    } else {
      console.log('');
      console.log(`❌ Server returned error status: ${response.statusCode}`);
    }

  } catch (error) {
    console.log('');
    console.log(`❌ Request failed: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('💡 This suggests the server is not responding');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 This suggests the server is not running');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This suggests a DNS or network issue');
    } else if (error.message.includes('504')) {
      console.log('💡 This suggests DigitalOcean App Platform is not forwarding requests to the app');
    }
  }
}

testUltraMinimalServer();
