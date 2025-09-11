const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Production logger
const logger = {
  info: (message, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      meta,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log(JSON.stringify(logEntry));
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  error: (message, error = null, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      meta,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.error(JSON.stringify(logEntry));
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  warn: (message, meta = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      meta,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.warn(JSON.stringify(logEntry));
    
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    }
  },

  // Request logger middleware
  requestLogger: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        environment: process.env.NODE_ENV || 'development'
      };
      
      if (res.statusCode >= 400) {
        logger.error('HTTP Request Error', null, logEntry);
      } else {
        logger.info('HTTP Request', logEntry);
      }
    });
    
    next();
  }
};

module.exports = logger;
