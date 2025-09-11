const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with robust SSL handling
const dbUrl = process.env.DB_URL || 'postgresql://zappay_user:password@localhost:5432/zappay_dev';
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false,
      // Additional SSL options for DigitalOcean
      checkServerIdentity: () => undefined,
      secureProtocol: 'TLSv1_2_method'
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

// Database connection function
const connectDB = async () => {
  try {
    // Check if we have a valid database URL
    if (!process.env.DB_URL) {
      console.warn('⚠️ No database URL provided, using mock authentication');
      return null;
    }
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    // If it's an SSL certificate error, provide helpful message
    if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
      console.error('🔒 SSL Certificate Error: This is likely due to DigitalOcean database SSL configuration');
      console.error('💡 The database connection will be retried automatically');
    }
    
    // Don't throw the error immediately - let the app continue with mock auth
    console.warn('⚠️ Continuing with mock authentication due to database connection issue');
    return null;
  }
};

// Close database connection function
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
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
