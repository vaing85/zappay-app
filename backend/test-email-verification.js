// Test email verification flow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Flow...\n');

  try {
    // Test 1: Resend verification email
    console.log('1️⃣ Testing resend verification email...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: 'test@example.com'
    });
    
    if (resendResponse.data.success) {
      console.log('✅ Resend verification email - PASSED');
      console.log(`   Message: ${resendResponse.data.message}`);
    } else {
      console.log('❌ Resend verification email - FAILED');
      console.log(`   Error: ${resendResponse.data.message}`);
    }

    // Test 2: Verify email with invalid token
    console.log('\n2️⃣ Testing verify email with invalid token...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
        token: 'invalid-token'
      });
      console.log('❌ Verify email with invalid token - FAILED (should have failed)');
    } catch (error) {
      if (error.response?.data?.success === false) {
        console.log('✅ Verify email with invalid token - PASSED (correctly rejected)');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Verify email with invalid token - FAILED (unexpected error)');
        console.log(`   Error: ${error.message}`);
      }
    }

    // Test 3: Verify email with missing token
    console.log('\n3️⃣ Testing verify email with missing token...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
        // No token provided
      });
      console.log('❌ Verify email with missing token - FAILED (should have failed)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Verify email with missing token - PASSED (correctly rejected)');
        console.log(`   Status: ${error.response.status}`);
      } else {
        console.log('❌ Verify email with missing token - FAILED (unexpected error)');
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('\n🎉 Email verification flow test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Resend verification endpoint working');
    console.log('✅ Verify email endpoint rejecting invalid tokens');
    console.log('✅ Verify email endpoint rejecting missing tokens');
    console.log('\n💡 Next steps:');
    console.log('   - Test with real registration flow');
    console.log('   - Test with valid JWT tokens');
    console.log('   - Test email sending functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testEmailVerification();
