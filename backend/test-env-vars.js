// Test environment variables in production
const axios = require('axios');

async function testEnvVars() {
  console.log('🧪 Testing environment variables...\n');
  
  try {
    // Test a simple endpoint that should show environment variables
    const response = await axios.get('https://zappayapp-ie9d2.ondigitalocean.app/health');
    console.log('✅ Health check successful');
    console.log('Response:', response.data);
    
    // Try to trigger CORS logging by making a request with origin
    console.log('\n🔍 Testing CORS with origin header...');
    try {
      await axios.options('https://zappayapp-ie9d2.ondigitalocean.app/api/auth/register', {
        headers: {
          'Origin': 'https://zappay.site',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      console.log('CORS Error Response:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testEnvVars().catch(console.error);
