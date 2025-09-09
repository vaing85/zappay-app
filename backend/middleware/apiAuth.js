const jwt = require('jsonwebtoken');

// Mock API key validation - in production, validate against database
const validateAPIKey = (apiKey) => {
  // Check if API key format is valid
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Check if it starts with the correct prefix
  if (!apiKey.startsWith('zappay_live_') && !apiKey.startsWith('zappay_test_')) {
    return false;
  }

  // Check if it has the correct length (prefix + 16 characters)
  if (apiKey.length !== 22) {
    return false;
  }

  // In production, you would:
  // 1. Look up the API key in the database
  // 2. Check if it's active and not expired
  // 3. Check if the user has the required permissions
  // 4. Log the API usage for rate limiting and analytics

  return true;
};

// Middleware to authenticate API requests
const authenticateAPIKey = (req, res, next) => {
  try {
    // Get API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'API key is required. Include it in the Authorization header as "Bearer your_api_key"'
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use "Bearer your_api_key"'
      });
    }

    const apiKey = parts[1];

    // Validate the API key
    if (!validateAPIKey(apiKey)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    // In production, you would:
    // 1. Get user information from the API key
    // 2. Check rate limits
    // 3. Log the request for analytics
    // 4. Add user context to the request

    // Mock user data for demo
    req.apiUser = {
      id: 'api_user_123',
      apiKey: apiKey,
      permissions: ['payments:read', 'payments:write', 'transactions:read'],
      rateLimit: {
        requests: 1000,
        window: 3600000, // 1 hour
        remaining: 950
      }
    };

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.apiUser.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Rate limiting middleware for API endpoints
const createRateLimit = (windowMs, maxRequests) => {
  const requests = new Map();

  return (req, res, next) => {
    const apiKey = req.apiUser?.apiKey;
    if (!apiKey) {
      return next();
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this API key
    const userRequests = requests.get(apiKey) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(apiKey, recentRequests);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - recentRequests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

module.exports = {
  authenticateAPIKey,
  requirePermission,
  createRateLimit,
  validateAPIKey
};
