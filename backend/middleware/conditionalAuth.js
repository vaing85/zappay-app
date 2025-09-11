const authenticateToken = require('./auth');

// Middleware that applies authentication conditionally
const conditionalAuth = (req, res, next) => {
  // Check if the current route is public
  const isPublicRoute = req.path.startsWith('/api/payments/methods/') || 
                       req.path === '/api/payments/health';
  
  console.log(`🔍 Conditional Auth - Path: ${req.path}, IsPublic: ${isPublicRoute}`);
  
  if (isPublicRoute) {
    // Skip authentication for public routes
    console.log(`✅ Skipping auth for public route: ${req.path}`);
    return next();
  }
  
  // Apply authentication for protected routes
  console.log(`🔒 Applying auth for protected route: ${req.path}`);
  return authenticateToken(req, res, next);
};

module.exports = conditionalAuth;
