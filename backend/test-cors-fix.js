// Test CORS fix for zappay.site
const axios = require('axios');

async function testCORSFix() {
  console.log('🧪 Testing CORS fix for zappay.site...\n');
  
  try {
    // Test OPTIONS preflight request
    console.log('1. Testing OPTIONS preflight request...');
    const optionsResponse = await axios.options('https://zappayapp-ie9d2.ondigitalocean.app/api/auth/register', {
      headers: {
        'Origin': 'https://zappay.site',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ OPTIONS request successful');
    console.log('Status:', optionsResponse.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': optionsResponse.headers['access-control-allow-credentials']
    });
    
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.response?.status, error.response?.data);
  }
  
  try {
    // Test actual POST request
    console.log('\n2. Testing POST request...');
    const postResponse = await axios.post('https://zappayapp-ie9d2.ondigitalocean.app/api/auth/register', {
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    }, {
      headers: {
        'Origin': 'https://zappay.site',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST request successful');
    console.log('Status:', postResponse.status);
    console.log('Response:', postResponse.data);
    
  } catch (error) {
    console.log('❌ POST request failed:', error.response?.status, error.response?.data);
  }
  
  console.log('\n🏁 CORS test completed');
}

testCORSFix().catch(console.error);
