// Set environment variable for testing
process.env.MONGODB_URI = 'mongodb+srv://villaaing_db_user:w8IiTCl5d5gzR7Jk@cluster0.8zftps3.mongodb.net/zappay?retryWrites=true&w=majority&appName=Cluster0';
process.env.MONGODB_DB_NAME = 'zappay';

const { connectMongoDB, getCollection, healthCheck } = require('./config/mongodb');

async function testMongoDB() {
  try {
    console.log('🚀 Testing MongoDB Atlas connection...');
    
    // Test connection
    await connectMongoDB();
    console.log('✅ MongoDB Atlas connected successfully!');
    
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
    
    console.log('🎉 MongoDB Atlas is ready for ZapPay!');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas test failed:', error.message);
    console.error('📝 Error details:', error);
  } finally {
    process.exit(0);
  }
}

testMongoDB();
