const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMongoDBAPI() {
  try {
    console.log('🚀 Testing MongoDB Atlas API endpoints...\n');

    // Test 1: Create a user
    console.log('1️⃣ Creating a test user...');
    const createUserResponse = await axios.post(`${BASE_URL}/api/mongo/users`, {
      email: 'test@zappay.com',
      name: 'Test User',
      password: 'password123'
    });
    
    if (createUserResponse.data.success) {
      console.log('✅ User created successfully:', createUserResponse.data.user);
      const userId = createUserResponse.data.user.id;
      
      // Test 2: Get user by ID
      console.log('\n2️⃣ Getting user by ID...');
      const getUserResponse = await axios.get(`${BASE_URL}/api/mongo/users/${userId}`);
      console.log('✅ User retrieved:', getUserResponse.data.user);
      
      // Test 3: Update user balance
      console.log('\n3️⃣ Updating user balance...');
      const updateBalanceResponse = await axios.patch(`${BASE_URL}/api/mongo/users/${userId}/balance`, {
        amount: 1000
      });
      console.log('✅ Balance updated:', updateBalanceResponse.data);
      
      // Test 4: Create another user for transaction
      console.log('\n4️⃣ Creating second user for transaction...');
      const createUser2Response = await axios.post(`${BASE_URL}/api/mongo/users`, {
        email: 'test2@zappay.com',
        name: 'Test User 2',
        password: 'password123'
      });
      const userId2 = createUser2Response.data.user.id;
      console.log('✅ Second user created:', createUser2Response.data.user);
      
      // Test 5: Create a transaction
      console.log('\n5️⃣ Creating a transaction...');
      const createTransactionResponse = await axios.post(`${BASE_URL}/api/mongo/transactions`, {
        fromUserId: userId,
        toUserId: userId2,
        amount: 100,
        description: 'Test payment',
        type: 'transfer'
      });
      console.log('✅ Transaction created:', createTransactionResponse.data.transaction);
      
      // Test 6: Get user transactions
      console.log('\n6️⃣ Getting user transactions...');
      const getTransactionsResponse = await axios.get(`${BASE_URL}/api/mongo/transactions/user/${userId}`);
      console.log('✅ User transactions:', getTransactionsResponse.data.transactions);
      
      // Test 7: Get transaction statistics
      console.log('\n7️⃣ Getting transaction statistics...');
      const getStatsResponse = await axios.get(`${BASE_URL}/api/mongo/transactions/stats/${userId}`);
      console.log('✅ Transaction stats:', getStatsResponse.data.stats);
      
      console.log('\n🎉 All MongoDB Atlas API tests passed!');
      
    } else {
      console.log('❌ Failed to create user:', createUserResponse.data);
    }
    
  } catch (error) {
    console.error('❌ MongoDB Atlas API test failed:', error.response?.data || error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   cd backend && npm start');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testMongoDBAPI();
  }
}

main();
