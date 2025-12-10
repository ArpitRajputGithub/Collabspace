const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request object
    next(); // Continue to the protected route
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but we don't fail the request
      req.user = null;
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
