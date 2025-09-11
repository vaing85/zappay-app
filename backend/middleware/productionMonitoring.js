const winston = require('winston');
const { performance } = require('perf_hooks');

// Production logging configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zappay-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    const metrics = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      memoryUsage: {
        rss: Math.round((endMemory.rss - startMemory.rss) / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(endMemory.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(endMemory.external / 1024 / 1024 * 100) / 100 // MB
      },
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.id
    };

    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow request detected', metrics);
    }

    // Log high memory usage
    if (metrics.memoryUsage.heapUsed > 100) { // More than 100MB
      logger.warn('High memory usage detected', metrics);
    }

    // Log 4xx and 5xx responses
    if (res.statusCode >= 400) {
      logger.error('Error response', metrics);
    }

    // Log successful requests in production
    if (process.env.NODE_ENV === 'production' && res.statusCode < 400) {
      logger.info('Request completed', metrics);
    }
  });

  next();
};

// Error tracking middleware
const errorTracker = (err, req, res, next) => {
  const errorInfo = {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };

  logger.error('Unhandled error', errorInfo);

  // Send error to external monitoring service if configured
  if (process.env.SENTRY_DSN) {
    // Sentry integration would go here
    console.log('Sentry error tracking would be sent here');
  }

  next(err);
};

// Health check middleware
const healthCheck = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  // Check database connection
  if (req.app.locals.db) {
    health.database = 'connected';
  } else {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  // Check Redis connection
  if (req.app.locals.redis) {
    health.redis = 'connected';
  } else {
    health.redis = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

// Metrics endpoint
const metrics = (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  res.json(metrics);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    requestId: req.id
  };

  logger.info('Incoming request', logData);
  next();
};

// Security event logging
const securityLogger = (event, details) => {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  performanceMonitor,
  errorTracker,
  healthCheck,
  metrics,
  requestLogger,
  securityLogger
};
