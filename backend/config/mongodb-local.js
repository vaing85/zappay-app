const { MongoClient } = require('mongodb');
require('dotenv').config();

// Local MongoDB connection string (port 5000)
const MONGODB_URI = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:5000/zappay';

// Database name
const DB_NAME = process.env.MONGODB_DB_NAME || 'zappay';

// Connection options for local MongoDB
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let db;

// Connect to local MongoDB
const connectMongoDB = async () => {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      console.log('✅ Local MongoDB connected successfully on port 5000');
    }
    
    if (!db) {
      db = client.db(DB_NAME);
      console.log(`✅ Connected to local database: ${DB_NAME}`);
    }
    
    return { client, db };
  } catch (error) {
    console.error('❌ Local MongoDB connection failed:', error.message);
    throw error;
  }
};

// Get database instance
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectMongoDB() first.');
  }
  return db;
};

// Get collection
const getCollection = (collectionName) => {
  const database = getDB();
  return database.collection(collectionName);
};

// Close connection
const closeMongoDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log('✅ Local MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing local MongoDB connection:', error.message);
  }
};

// Health check
const healthCheck = async () => {
  try {
    const database = getDB();
    await database.admin().ping();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

module.exports = {
  connectMongoDB,
  getDB,
  getCollection,
  closeMongoDB,
  healthCheck,
  MONGODB_URI,
  DB_NAME
};
