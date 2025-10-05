const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * MongoDB Atlas Configuration
 * Secure connection using environment variables only
 */

// MongoDB Atlas connection string - MUST be set in environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Database name with fallback
const DB_NAME = process.env.MONGODB_DB_NAME || 'zappay';

// Enhanced connection options for production
const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  retryWrites: true, // Retry writes on network errors
  retryReads: true, // Retry reads on network errors
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
};

// Connection state management
let client = null;
let db = null;
let isConnected = false;
let connectionPromise = null;

/**
 * Connect to MongoDB Atlas with enhanced error handling and connection management
 * @returns {Promise<{client: MongoClient, db: Db}>} Connection objects
 */
const connectMongoDB = async () => {
  try {
    // Validate environment variables
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required. Please set it in your .env file or environment variables.');
    }

    // Return existing connection if already connected
    if (isConnected && client && db) {
      return { client, db };
    }

    // Prevent multiple simultaneous connection attempts
    if (connectionPromise) {
      return await connectionPromise;
    }

    // Create new connection promise
    connectionPromise = (async () => {
      try {
        // Create new client with enhanced options
        client = new MongoClient(MONGODB_URI, connectionOptions);
        
        // Connect to MongoDB Atlas
        await client.connect();
        
        // Verify connection
        await client.db('admin').command({ ping: 1 });
        
        // Get database instance
        db = client.db(DB_NAME);
        
        // Update connection state
        isConnected = true;
        
        console.log('✅ MongoDB Atlas connected successfully');
        console.log(`✅ Connected to database: ${DB_NAME}`);
        
        return { client, db };
      } catch (error) {
        // Reset connection state on failure
        isConnected = false;
        client = null;
        db = null;
        throw error;
      } finally {
        // Clear connection promise
        connectionPromise = null;
      }
    })();

    return await connectionPromise;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.error('❌ Connection details:', {
      hasUri: !!MONGODB_URI,
      dbName: DB_NAME,
      error: error.name
    });
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

/**
 * Get database instance with connection validation
 * @returns {Db} MongoDB database instance
 */
const getDB = () => {
  if (!db || !isConnected) {
    throw new Error('Database not connected. Call connectMongoDB() first.');
  }
  return db;
};

/**
 * Get collection with validation
 * @param {string} collectionName - Name of the collection
 * @returns {Collection} MongoDB collection instance
 */
const getCollection = (collectionName) => {
  if (!collectionName || typeof collectionName !== 'string') {
    throw new Error('Collection name must be a non-empty string');
  }
  
  const database = getDB();
  return database.collection(collectionName);
};

/**
 * Close MongoDB connection gracefully
 * @returns {Promise<void>}
 */
const closeMongoDB = async () => {
  try {
    if (client && isConnected) {
      await client.close();
      console.log('✅ MongoDB Atlas connection closed gracefully');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB Atlas connection:', error.message);
  } finally {
    // Reset connection state
    client = null;
    db = null;
    isConnected = false;
    connectionPromise = null;
  }
};

/**
 * Health check with detailed status information
 * @returns {Promise<Object>} Health status object
 */
const healthCheck = async () => {
  try {
    if (!isConnected || !db) {
      return { 
        status: 'unhealthy', 
        error: 'Not connected to database',
        timestamp: new Date().toISOString() 
      };
    }

    // Test database connection
    await db.admin().ping();
    
    // Get server status
    const serverStatus = await db.admin().serverStatus();
    
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: DB_NAME,
      uptime: serverStatus.uptime,
      version: serverStatus.version,
      connections: serverStatus.connections
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
};

/**
 * Get connection status
 * @returns {Object} Connection status information
 */
const getConnectionStatus = () => {
  return {
    isConnected,
    hasClient: !!client,
    hasDb: !!db,
    dbName: DB_NAME,
    hasUri: !!MONGODB_URI
  };
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, closing MongoDB connection...');
  await closeMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, closing MongoDB connection...');
  await closeMongoDB();
  process.exit(0);
});

module.exports = {
  connectMongoDB,
  getDB,
  getCollection,
  closeMongoDB,
  healthCheck,
  getConnectionStatus,
  MONGODB_URI,
  DB_NAME
};
