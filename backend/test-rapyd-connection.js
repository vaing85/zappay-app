// Test Rapyd Connection
// This script tests the Rapyd integration without requiring authentication

const axios = require('axios');

async function testRapydConnection() {
  try {
    console.log('🧪 Testing Rapyd connection...');
    
    // Test the test endpoint
    const response = await axios.post('https://zappayapp-ie9d2.ondigitalocean.app/api/payments/test');
    
    console.log('✅ Rapyd connection successful!');
    console.log('Response:', response.data);
    
    if (response.data.availableMethods) {
      console.log(`📊 Available payment methods: ${response.data.availableMethods}`);
    }
    
  } catch (error) {
    console.error('❌ Rapyd connection failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('🔑 Authentication required - this is expected for protected endpoints');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRapydConnection();
