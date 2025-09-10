const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    // Check if Redis URL is available
    if (!process.env.REDIS_URL) {
      console.warn('⚠️ REDIS_URL not set, skipping Redis connection');
      return null;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            console.warn('⚠️ Redis reconnection failed after 2 attempts, disabling Redis');
            return false; // Stop trying to reconnect
          }
          return Math.min(retries * 200, 2000); // Faster backoff
        },
        // Add security settings
        tls: process.env.NODE_ENV === 'production' ? {} : undefined,
        connectTimeout: 5000, // Shorter timeout
        lazyConnect: true
      },
      // Add authentication and security
      username: process.env.REDIS_USERNAME || undefined,
      database: 0
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis Client Error:', err.message);
      // Log specific error types
      if (err.message.includes('AUTH') || err.message.includes('password')) {
        console.error('🚨 Redis Authentication Error - Check credentials');
      } else if (err.message.includes('ECONNREFUSED') || err.message.includes('timeout')) {
        console.error('🚨 Redis Connection Error - Check network/firewall');
      } else if (err.message.includes('Socket closed')) {
        console.warn('⚠️ Redis socket closed - Redis may be unavailable');
      }
      // Don't throw error, just log it
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

    redisClient.on('disconnect', () => {
      console.warn('⚠️ Redis Client Disconnected');
    });

    redisClient.on('end', () => {
      console.warn('⚠️ Redis Client Connection Ended');
    });

    // Try to connect with a timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);
    
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis connection failed:', error.message);
    console.warn('⚠️ Continuing without Redis - caching will be disabled');
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
