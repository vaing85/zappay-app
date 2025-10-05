const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Database name
const DB_NAME = process.env.MONGODB_DB_NAME || 'zappay';

// Connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

let client;
let db;

// Connect to MongoDB Atlas
const connectMongoDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    if (!client) {
      client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      console.log('✅ MongoDB Atlas connected successfully');
    }
    
    if (!db) {
      db = client.db(DB_NAME);
      console.log(`✅ Connected to database: ${DB_NAME}`);
    }
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
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
      console.log('✅ MongoDB Atlas connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB Atlas connection:', error.message);
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
