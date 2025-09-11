const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Production security middleware
const productionSecurity = (app) => {
  // Enhanced Helmet configuration for production
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
        imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
        connectSrc: [
          "'self'", 
          "https://api.stripe.com",
          "https://sandboxapi.rapyd.net", 
          "https://api.rapyd.net",
          "wss://api.zappay.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // Allow Stripe embeds
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Request ID middleware for tracking
  app.use((req, res, next) => {
    req.id = req.get('X-Request-ID') || 
             req.get('X-Correlation-ID') || 
             `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.set('X-Request-ID', req.id);
    next();
  });

  // Security headers middleware
  app.use((req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });

  // IP whitelist middleware (for admin endpoints)
  const ipWhitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
  if (ipWhitelist.length > 0) {
    app.use('/api/admin', (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      if (!ipWhitelist.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP address'
        });
      }
      next();
    });
  }

  // Request size limiting
  app.use((req, res, next) => {
    const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 10 * 1024 * 1024; // 10MB
    if (req.get('content-length') && parseInt(req.get('content-length')) > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request entity too large'
      });
    }
    next();
  });

  // SQL injection protection middleware
  app.use((req, res, next) => {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\bUNION\s+SELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(\bUPDATE\s+SET\b)/i
    ];

    const checkForSQLInjection = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          for (const pattern of sqlInjectionPatterns) {
            if (pattern.test(obj[key])) {
              return true;
            }
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkForSQLInjection(obj[key])) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data detected'
      });
    }

    next();
  });

  // XSS protection middleware
  app.use((req, res, next) => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi
    ];

    const sanitizeInput = (input) => {
      if (typeof input === 'string') {
        return input.replace(/[<>]/g, (match) => {
          return match === '<' ? '&lt;' : '&gt;';
        });
      }
      return input;
    };

    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);

    next();
  });
};

module.exports = productionSecurity;
