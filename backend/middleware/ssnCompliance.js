// SSN Compliance and Security Middleware
// Ensures proper handling of SSN data according to regulations

const SSNValidation = require('../utils/ssnValidation');

// Audit log for SSN access
const auditSSNAccess = (req, action, userId, ssnMasked) => {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    ssnMasked,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    endpoint: req.originalUrl,
    method: req.method
  };
  
  console.log('SSN_AUDIT:', JSON.stringify(auditLog));
  
  // In production, send to secure audit service
  // await sendToAuditService(auditLog);
};

// Middleware to validate SSN in request body
const validateSSNRequest = (req, res, next) => {
  if (req.body.ssn) {
    const validation = SSNValidation.validateSSN(req.body.ssn);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SSN format',
        error: validation.error
      });
    }
    
    // Log SSN access attempt
    auditSSNAccess(req, 'SSN_VALIDATION', req.user?.id, SSNValidation.maskSSN(req.body.ssn));
  }
  
  next();
};

// Middleware to mask SSN in responses
const maskSSNInResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      // Recursively mask SSN in response data
      const maskSSNRecursive = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(maskSSNRecursive);
        } else if (obj && typeof obj === 'object') {
          const masked = { ...obj };
          for (const key in masked) {
            if (key.toLowerCase().includes('ssn') && typeof masked[key] === 'string') {
              masked[key] = SSNValidation.maskSSN(masked[key]);
            } else {
              masked[key] = maskSSNRecursive(masked[key]);
            }
          }
          return masked;
        }
        return obj;
      };
      
      data = maskSSNRecursive(data);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware to ensure SSN is not logged
const preventSSNLogging = (req, res, next) => {
  // Remove SSN from request body before logging
  if (req.body && req.body.ssn) {
    req.body.ssn = '[REDACTED]';
  }
  
  // Remove SSN from query parameters
  if (req.query && req.query.ssn) {
    req.query.ssn = '[REDACTED]';
  }
  
  next();
};

// Rate limiting for SSN-related endpoints
const ssnRateLimit = (req, res, next) => {
  // Implement stricter rate limiting for SSN operations
  // This would integrate with your existing rate limiting system
  next();
};

// Compliance check middleware
const complianceCheck = (req, res, next) => {
  // Check if user has consented to SSN collection
  if (req.body.ssn && !req.body.ssnConsent) {
    return res.status(400).json({
      success: false,
      message: 'SSN collection requires explicit consent',
      error: 'SSN_CONSENT_REQUIRED'
    });
  }
  
  // Check if SSN collection is allowed in this jurisdiction
  const userCountry = req.headers['x-user-country'] || 'US';
  if (req.body.ssn && !isSSNCollectionAllowed(userCountry)) {
    return res.status(400).json({
      success: false,
      message: 'SSN collection not allowed in your jurisdiction',
      error: 'SSN_COLLECTION_NOT_ALLOWED'
    });
  }
  
  next();
};

// Check if SSN collection is allowed in a jurisdiction
const isSSNCollectionAllowed = (country) => {
  const allowedCountries = ['US', 'CA']; // Add more as needed
  return allowedCountries.includes(country.toUpperCase());
};

// SSN data retention policy
const enforceDataRetention = (req, res, next) => {
  // Implement data retention policies
  // This would check if SSN data should be deleted based on age
  next();
};

// Export middleware functions
module.exports = {
  validateSSNRequest,
  maskSSNInResponse,
  preventSSNLogging,
  ssnRateLimit,
  complianceCheck,
  enforceDataRetention,
  auditSSNAccess
};
