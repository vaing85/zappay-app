#!/usr/bin/env node

/**
 * ZapPay Production Database Setup Script
 * This script sets up the production database with proper configuration
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DB_URL) {
    return {
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
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          ...(process.env.DB_CA_CERT && {
            ca: process.env.DB_CA_CERT,
            cert: process.env.DB_CLIENT_CERT,
            key: process.env.DB_CLIENT_KEY,
          })
        } : false
      }
    };
  }
  
  return {
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
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        ...(process.env.DB_CA_CERT && {
          ca: process.env.DB_CA_CERT,
          cert: process.env.DB_CLIENT_CERT,
          key: process.env.DB_CLIENT_KEY,
        })
      } : false
    }
  };
};

// Create database if it doesn't exist
const createDatabase = async () => {
  const config = getDatabaseConfig();
  
  // For DB_URL, we need to create a connection without specifying the database
  if (process.env.DB_URL) {
    const url = new URL(process.env.DB_URL);
    const adminConfig = {
      host: url.hostname,
      port: url.port || 5432,
      username: url.username,
      password: url.password,
      dialect: 'postgres',
      logging: false
    };
    
    const adminSequelize = new Sequelize(adminConfig);
    
    try {
      await adminSequelize.query(`CREATE DATABASE "${url.pathname.slice(1)}"`);
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Database already exists');
      } else {
        throw error;
      }
    } finally {
      await adminSequelize.close();
    }
  } else {
    // For individual environment variables
    const adminConfig = {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      dialect: 'postgres',
      logging: false
    };
    
    const adminSequelize = new Sequelize(adminConfig);
    
    try {
      await adminSequelize.query(`CREATE DATABASE "${config.database}"`);
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Database already exists');
      } else {
        throw error;
      }
    } finally {
      await adminSequelize.close();
    }
  }
};

// Test database connection
const testConnection = async () => {
  const config = getDatabaseConfig();
  const sequelize = new Sequelize(config);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
};

// Create database tables
const createTables = async () => {
  const config = getDatabaseConfig();
  const sequelize = new Sequelize(config);
  
  try {
    // Import models
    const User = require('./models/User')(sequelize);
    const Transaction = require('./models/Transaction')(sequelize);
    const Group = require('./models/Group')(sequelize);
    const Budget = require('./models/Budget')(sequelize);
    const Notification = require('./models/Notification')(sequelize);
    
    // Define associations
    const models = { User, Transaction, Group, Budget, Notification };
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });
    
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database tables created/updated successfully');
    
    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON "Users" (email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON "Users" (phone);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON "Transactions" ("userId");
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON "Transactions" ("createdAt");
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON "Transactions" (status);
      CREATE INDEX IF NOT EXISTS idx_groups_user_id ON "Groups" ("userId");
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON "Budgets" ("userId");
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notifications" ("userId");
    `);
    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Create production database user with limited privileges
const createDatabaseUser = async () => {
  if (process.env.DB_URL) {
    console.log('ℹ️  Using connection string, skipping user creation');
    return;
  }
  
  const adminConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: 'postgres', // Admin user
    password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: false
  };
  
  const adminSequelize = new Sequelize(adminConfig);
  
  try {
    const dbName = process.env.DB_NAME || 'zappay_production';
    const dbUser = process.env.DB_USER || 'zappay_user';
    const dbPassword = process.env.DB_PASSWORD || 'password';
    
    // Create user
    await adminSequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${dbUser}') THEN
          CREATE ROLE ${dbUser} WITH LOGIN PASSWORD '${dbPassword}';
        END IF;
      END
      $$;
    `);
    
    // Grant privileges
    await adminSequelize.query(`
      GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser};
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser};
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${dbUser};
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${dbUser};
    `);
    
    console.log('✅ Database user created successfully');
  } catch (error) {
    console.error('❌ Error creating database user:', error.message);
    throw error;
  } finally {
    await adminSequelize.close();
  }
};

// Main setup function
const setupProductionDatabase = async () => {
  console.log('🚀 Setting up ZapPay Production Database...');
  
  try {
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.error('❌ .env file not found. Please run setup-production.sh first.');
      process.exit(1);
    }
    
    // Test connection first
    console.log('🔍 Testing database connection...');
    const connectionOk = await testConnection();
    
    if (!connectionOk) {
      console.log('🔧 Creating database...');
      await createDatabase();
      
      console.log('👤 Creating database user...');
      await createDatabaseUser();
      
      console.log('🔍 Testing connection again...');
      const connectionOk2 = await testConnection();
      
      if (!connectionOk2) {
        console.error('❌ Database setup failed. Please check your configuration.');
        process.exit(1);
      }
    }
    
    console.log('📊 Creating database tables...');
    await createTables();
    
    console.log('🎉 Production database setup complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Verify your database configuration in .env');
    console.log('2. Test the API endpoints');
    console.log('3. Set up monitoring and logging');
    console.log('4. Deploy to production');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('📝 Error details:', error.stack);
    process.exit(1);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = {
  setupProductionDatabase,
  createDatabase,
  testConnection,
  createTables,
  createDatabaseUser
};
