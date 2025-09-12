#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Tests database connection with SSL configuration
 */

const { Sequelize } = require('sequelize');

console.log('🔍 Testing Database Connection...');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Test database configuration
const testConfig = {
  url: process.env.DB_URL || 'postgresql://test:test@localhost:5432/test',
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
      checkServerIdentity: false
    } : false
  }
};

console.log('📊 Configuration:');
console.log('  URL:', testConfig.url);
console.log('  SSL:', testConfig.dialectOptions.ssl);

const sequelize = new Sequelize(testConfig);

async function testConnection() {
  try {
    console.log('\n🚀 Attempting database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result[0][0]);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('  Error:', error.message);
    console.error('  Code:', error.code);
    console.error('  SQL State:', error.sqlState);
    
    if (error.message.includes('self-signed certificate')) {
      console.log('\n💡 SSL Certificate Issue Detected');
      console.log('   This is expected for DigitalOcean managed databases');
      console.log('   The app should handle this gracefully');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection Refused');
      console.log('   Database server is not running or not accessible');
    }
    
  } finally {
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

testConnection();
