const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// Database configuration with SSL handling for managed databases
const getDatabaseConfig = () => {
  // If DB_URL is provided, parse it and handle SSL
  if (process.env.DB_URL) {
    return {
      url: process.env.DB_URL,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false, // Set to false for DigitalOcean managed databases
          // Use certificates if available, otherwise fall back to connection string SSL
          ...(process.env.DB_CA_CERT && {
            ca: process.env.DB_CA_CERT,
            cert: process.env.DB_CLIENT_CERT,
            key: process.env.DB_CLIENT_KEY,
          })
        } : false
      }
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'zappay_production',
    username: process.env.DB_USER || 'zappay_user',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false, // Set to false for DigitalOcean managed databases
        // Use certificates if available, otherwise fall back to connection string SSL
        ...(process.env.DB_CA_CERT && {
          ca: process.env.DB_CA_CERT,
          cert: process.env.DB_CLIENT_CERT,
          key: process.env.DB_CLIENT_KEY,
        })
      } : false
    }
  };
};

const sequelize = new Sequelize(getDatabaseConfig());

// Initialize models
const models = {
  User: User(sequelize),
  Transaction: Transaction(sequelize),
  Group: Group(sequelize),
  Budget: Budget(sequelize),
  Notification: Notification(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Database connection function with aggressive SSL bypass
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
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  models,
  connectDB,
  closeDB
};
