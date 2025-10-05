// Set environment variable for local MongoDB
process.env.MONGODB_LOCAL_URI = 'mongodb://localhost:5000/zappay';
process.env.MONGODB_DB_NAME = 'zappay';

const { connectMongoDB, getCollection, healthCheck } = require('./config/mongodb-local');

async function testLocalMongoDB() {
  try {
    console.log('🚀 Testing Local MongoDB on port 5000...');
    
    // Test connection
    await connectMongoDB();
    console.log('✅ Local MongoDB connected successfully!');
    
    // Test health check
    const health = await healthCheck();
    console.log('📊 Health check:', health);
    
    // Test collection access
    const usersCollection = getCollection('users');
    console.log('✅ Users collection accessible');
    
    const transactionsCollection = getCollection('transactions');
    console.log('✅ Transactions collection accessible');
    
    // Test a simple operation
    const testUser = {
      email: 'test@zappay.com',
      name: 'Test User',
      balance: 0,
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Test user created:', result.insertedId);
    
    // Clean up test data
    await usersCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 Local MongoDB on port 5000 is ready for ZapPay!');
    
  } catch (error) {
    console.error('❌ Local MongoDB test failed:', error.message);
    console.error('📝 Make sure MongoDB is running on port 5000:');
    console.error('   mongod --port 5000 --dbpath C:\\data\\db');
  } finally {
    process.exit(0);
  }
}

testLocalMongoDB();
