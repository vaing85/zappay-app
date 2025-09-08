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
          rejectUnauthorized: false,
          // Completely bypass SSL certificate validation for managed databases
          checkServerIdentity: () => undefined,
          agent: false
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
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
        agent: false
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
    
    // Handle SSL certificate errors with aggressive bypass
    if (error.message.includes('self-signed certificate') || 
        error.message.includes('certificate') || 
        error.message.includes('SSL') ||
        error.message.includes('TLS')) {
      
      console.warn('⚠️ SSL/TLS issue detected. Attempting connection with SSL completely disabled...');
      
      try {
        // Create a new connection with SSL completely disabled
        const sequelizeNoSSL = new Sequelize({
          url: process.env.DB_URL,
          dialect: 'postgres',
          logging: false,
          pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          dialectOptions: {
            ssl: false // Completely disable SSL
          }
        });
        
        await sequelizeNoSSL.authenticate();
        console.log('✅ Database connection established without SSL');
        
        if (process.env.NODE_ENV === 'production') {
          await sequelizeNoSSL.sync({ alter: true });
          console.log('✅ Database synchronized');
        }
        
        return sequelizeNoSSL;
      } catch (noSSLError) {
        console.error('❌ Database connection failed even without SSL:', noSSLError.message);
        console.error('📝 This might be a network connectivity or credential issue.');
        console.error('📝 Please check your database configuration.');
        throw noSSLError;
      }
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
