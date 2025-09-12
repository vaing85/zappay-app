const rateLimit = require('express-rate-limit');

// Production rate limiting configuration
const getRateLimitConfig = (windowMs, max, message, options = {}) => {
  const baseConfig = {
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 60000) + ' minutes',
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Enhanced security for production
    keyGenerator: (req) => {
      // Use IP + User-Agent for more accurate rate limiting
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'unknown';
      return `${ip}-${userAgent}`;
    },
    // Skip successful requests for auth endpoints
    skipSuccessfulRequests: options.skipSuccessful || false,
    // Skip failed requests for payment endpoints
    skipFailedRequests: options.skipFailed || false,
    // Custom skip function
    skip: options.skip || ((req) => {
      // Skip rate limiting for health checks and static assets
      return req.path === '/health' || 
             req.path === '/api/health' ||
             req.path.startsWith('/favicon') ||
             req.path.startsWith('/robots.txt') ||
             req.path.startsWith('/manifest.json');
    }),
    // Enhanced error handling
    handler: (req, res) => {
      const retryAfter = Math.ceil(windowMs / 60000);
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: retryAfter + ' minutes',
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      });
    }
  };

  return { ...baseConfig, ...options };
};

// General API rate limiter (production optimized)
const generalLimiter = rateLimit(getRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, // Configurable via env
  'Too many requests from this IP, please try again later',
  {
    skip: (req) => {
      // Skip rate limiting for health checks and static assets
      return req.path === '/health' || 
             req.path === '/api/health' ||
             req.path.startsWith('/favicon') ||
             req.path.startsWith('/robots.txt') ||
             req.path.startsWith('/manifest.json') ||
             req.path.startsWith('/logo') ||
             req.path.startsWith('/apple-touch-icon');
    }
  }
));

// Authentication endpoints (very restrictive for security)
const authLimiter = rateLimit(getRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  10, // 10 login attempts per window
  'Too many authentication attempts, please try again later',
  {
    skipSuccessful: true, // Don't count successful requests
    skip: (req) => {
      // Allow password reset attempts even if rate limited
      return req.path.includes('/password-reset') && req.method === 'POST';
    }
  }
));

// Payment endpoints (very restrictive for financial security)
const paymentLimiter = rateLimit(getRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  20, // 20 payment requests per window
  'Too many payment requests, please try again later',
  {
    skipFailed: true, // Don't count failed payment attempts
    skip: (req) => {
      // Allow webhook verification
      return req.path.includes('/webhook') && req.method === 'POST';
    }
  }
));

// Webhook endpoints (permissive for external services)
const webhookLimiter = rateLimit(getRateLimitConfig(
  1 * 60 * 1000, // 1 minute
  100, // 100 webhook requests per minute
  'Too many webhook requests, please try again later',
  {
    skip: (req) => {
      // Allow all webhook requests from known services
      const userAgent = req.get('User-Agent') || '';
      return userAgent.includes('Stripe') || 
             userAgent.includes('Twilio') || 
             userAgent.includes('SendGrid') ||
             userAgent.includes('Rapyd');
    }
  }
));

// Password reset endpoints (very restrictive)
const passwordResetLimiter = rateLimit(getRateLimitConfig(
  60 * 60 * 1000, // 1 hour
  3, // 3 password reset attempts per hour
  'Too many password reset attempts, please try again later',
  {
    skip: (req) => {
      // Allow verification of reset tokens
      return req.path.includes('/verify-reset-token') && req.method === 'GET';
    }
  }
));

// Admin endpoints (moderate restriction)
const adminLimiter = rateLimit(getRateLimitConfig(
  15 * 60 * 1000, // 15 minutes
  50, // 50 admin requests per window
  'Too many admin requests, please try again later',
  {
    skip: (req) => {
      // Allow health checks and monitoring
      return req.path === '/health' || req.path.includes('/metrics');
    }
  }
));

// File upload rate limiter (prevent abuse)
const uploadLimiter = rateLimit(getRateLimitConfig(
  60 * 60 * 1000, // 1 hour
  10, // 10 file uploads per hour
  'Too many file uploads, please try again later',
  {
    skip: (req) => {
      // Allow small profile pictures
      return req.path.includes('/profile-picture') && 
             req.get('content-length') < 5 * 1024 * 1024; // 5MB limit
    }
  }
));

// API key rate limiter (for external API access)
const apiKeyLimiter = rateLimit(getRateLimitConfig(
  60 * 60 * 1000, // 1 hour
  1000, // 1000 requests per hour per API key
  'API rate limit exceeded, please try again later',
  {
    keyGenerator: (req) => {
      // Use API key instead of IP for external API access
      const apiKey = req.get('X-API-Key') || req.query.api_key;
      return apiKey || req.ip;
    }
  }
));

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  webhookLimiter,
  passwordResetLimiter,
  adminLimiter,
  uploadLimiter,
  apiKeyLimiter,
  getRateLimitConfig // Export the config function for custom limiters
};
