const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// Database configuration
const sequelize = new Sequelize(process.env.DB_URL || {
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
      ca: process.env.DB_SSL_CA || undefined,
      key: process.env.DB_SSL_KEY || undefined,
      cert: process.env.DB_SSL_CERT || undefined,
      // Additional SSL options for managed databases
      checkServerIdentity: () => undefined,
      secureProtocol: 'TLSv1_2_method'
    } : false
  }
});

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

// Database connection function
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
    
    // Handle specific SSL certificate errors
    if (error.message.includes('self-signed certificate') || error.message.includes('certificate')) {
      console.warn('⚠️ SSL Certificate issue detected. This is common with managed databases.');
      console.warn('📝 The database connection will be retried with relaxed SSL settings.');
      
      // Try to reconnect with more relaxed SSL settings
      try {
        const sequelizeRelaxed = new Sequelize(process.env.DB_URL || {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME || 'zappay_production',
          username: process.env.DB_USER || 'zappay_user',
          password: process.env.DB_PASSWORD || 'password',
          dialect: 'postgres',
          logging: false,
          pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
              checkServerIdentity: () => undefined,
              secureProtocol: 'TLSv1_2_method',
              // Completely bypass SSL certificate validation for managed databases
              agent: false
            }
          }
        });
        
        await sequelizeRelaxed.authenticate();
        console.log('✅ Database connection established with relaxed SSL settings');
        
        if (process.env.NODE_ENV === 'production') {
          await sequelizeRelaxed.sync({ alter: true });
          console.log('✅ Database synchronized');
        }
        
        return sequelizeRelaxed;
      } catch (retryError) {
        console.error('❌ Database connection failed even with relaxed SSL:', retryError.message);
        
        // Final fallback: try without SSL (if the database allows it)
        console.warn('⚠️ Attempting final fallback: connection without SSL...');
        try {
          const sequelizeNoSSL = new Sequelize(process.env.DB_URL || {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'zappay_production',
            username: process.env.DB_USER || 'zappay_user',
            password: process.env.DB_PASSWORD || 'password',
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
          console.error('📝 Please check your database configuration and network connectivity.');
          throw noSSLError;
        }
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
