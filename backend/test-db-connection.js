const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('================================');
  
  // Check if DB_URL is set
  if (!process.env.DB_URL) {
    console.error('❌ DB_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('✅ DB_URL is set');
  console.log(`📍 Database URL: ${process.env.DB_URL.substring(0, 20)}...`);
  
  // Create Sequelize instance with SSL configuration
  const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false, // Disable SQL logging for cleaner output
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  try {
    console.log('🔄 Attempting to connect to database...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('🔄 Testing database query...');
    const result = await sequelize.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Database query successful!');
    console.log(`⏰ Current time: ${result[0][0].current_time}`);
    console.log(`🐘 PostgreSQL version: ${result[0][0].postgres_version.split(' ')[0]}`);
    
    // Test SSL connection info
    console.log('🔄 Checking SSL connection status...');
    const sslResult = await sequelize.query('SELECT ssl_is_used() as ssl_enabled');
    const sslEnabled = sslResult[0][0].ssl_enabled;
    console.log(`🔒 SSL enabled: ${sslEnabled ? '✅ YES' : '❌ NO'}`);
    
    if (sslEnabled) {
      console.log('🎉 SSL connection is working properly!');
    } else {
      console.log('⚠️  SSL connection is not enabled');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('SSL')) {
      console.error('   This appears to be an SSL-related error');
      console.error('   Make sure your DB_URL includes SSL parameters');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('   This appears to be a network connectivity error');
      console.error('   Check your database host and port');
    } else if (error.message.includes('authentication')) {
      console.error('   This appears to be an authentication error');
      console.error('   Check your database credentials');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n🎉 All database tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database test failed:', error.message);
    process.exit(1);
  });
