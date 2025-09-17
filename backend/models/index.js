const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with robust SSL handling for DigitalOcean
const dbUrl = process.env.DB_URL || 'postgresql://zappay_user:password@localhost:5432/zappay_dev';
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      // Additional SSL options for DigitalOcean compatibility
      checkServerIdentity: false,
      // Use certificates if available
      ...(process.env.DB_CA_CERT && {
        ca: process.env.DB_CA_CERT,
        cert: process.env.DB_CLIENT_CERT,
        key: process.env.DB_CLIENT_KEY,
      })
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Additional connection options
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 3
  }
});

// Import all models
const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Group = require('./Group')(sequelize);
const Budget = require('./Budget')(sequelize);
const Notification = require('./Notification')(sequelize);

// Define associations
User.associate({ User, Transaction, Group, Budget, Notification });
Transaction.associate({ User, Transaction, Group, Budget, Notification });
Group.associate({ User, Transaction, Group, Budget, Notification });
Budget.associate({ User, Transaction, Group, Budget, Notification });
Notification.associate({ User, Transaction, Group, Budget, Notification });

// Database connection function with error handling
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database in production (create tables if they don't exist)
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    
    // Log SSL/TLS connection issues for debugging
    if (error.message.includes('self-signed certificate') || 
        error.message.includes('certificate') || 
        error.message.includes('SSL') ||
        error.message.includes('TLS')) {
      
      console.error('🔒 SSL Certificate Error: This is likely due to DigitalOcean database SSL configuration');
      console.error('📝 For DigitalOcean managed databases, the connection string should include SSL parameters');
      console.error('📝 Check that DB_URL includes sslmode=require or similar SSL configuration');
      console.error('📝 If using individual variables, ensure DB_SSL_REJECT_UNAUTHORIZED is set correctly');
    }
    
    throw error;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Transaction,
  Group,
  Budget,
  Notification,
  connectDB,
  closeDB
};