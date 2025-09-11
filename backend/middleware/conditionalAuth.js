const authenticateToken = require('./auth');

// Middleware that applies authentication conditionally
const conditionalAuth = (req, res, next) => {
  // List of public routes that don't require authentication
  const publicRoutes = [
    '/api/payments/methods',
    '/api/payments/health'
  ];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    req.path.startsWith(route)
  );
  
  if (isPublicRoute) {
    // Skip authentication for public routes
    return next();
  }
  
  // Apply authentication for protected routes
  return authenticateToken(req, res, next);
};

module.exports = conditionalAuth;
