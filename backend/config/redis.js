const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️ Redis reconnection failed after 3 attempts');
            return false; // Stop trying to reconnect
          }
          return Math.min(retries * 100, 3000); // Exponential backoff
        }
      }
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis Client Error:', err.message);
      // Don't throw error, just log it
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

    redisClient.on('disconnect', () => {
      console.warn('⚠️ Redis Client Disconnected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis connection failed:', error.message);
    // Don't throw error, just return null
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    console.warn('⚠️ Redis client not available');
    return null;
  }
  return redisClient;
};

// Cache helper functions
const cache = {
  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      if (!client) {
        console.warn('⚠️ Redis not available, skipping cache set');
        return;
      }
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('⚠️ Redis set error:', error.message);
    }
  },

  async get(key) {
    try {
      const client = getRedisClient();
      if (!client) {
        console.warn('⚠️ Redis not available, cache miss');
        return null;
      }
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('⚠️ Redis get error:', error.message);
      return null;
    }
  },

  async del(key) {
    try {
      const client = getRedisClient();
      if (!client) {
        console.warn('⚠️ Redis not available, skipping cache delete');
        return;
      }
      await client.del(key);
    } catch (error) {
      console.warn('⚠️ Redis delete error:', error.message);
    }
  },

  async exists(key) {
    try {
      const client = getRedisClient();
      if (!client) {
        console.warn('⚠️ Redis not available, assuming cache miss');
        return false;
      }
      return await client.exists(key);
    } catch (error) {
      console.warn('⚠️ Redis exists error:', error.message);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cache
};
