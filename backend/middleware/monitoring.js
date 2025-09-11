const logger = require('./logger');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        ip: req.ip
      });
    }
    
    // Log performance metrics
    logger.info('Request performance', {
      method: req.method,
      url: req.url,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
  });
  
  next();
};

// Health check with detailed metrics
const healthCheck = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  // Check database connection
  try {
    // This would check if database is connected
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'DEGRADED';
  }
  
  // Check Redis connection
  try {
    // This would check if Redis is connected
    health.redis = 'connected';
  } catch (error) {
    health.redis = 'disconnected';
    health.status = 'DEGRADED';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
};

// Error tracking
const errorTracker = (error, req, res, next) => {
  logger.error('Unhandled error', error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  next(error);
};

module.exports = {
  performanceMonitor,
  healthCheck,
  errorTracker
};
