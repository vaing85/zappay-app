const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
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
