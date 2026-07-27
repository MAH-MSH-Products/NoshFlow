const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Auth Middleware: Verifies the JWT from the request headers.
 * If valid, attaches the user payload to the req object.
 */
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      
      // Attach user to req, populated with role. Exclude password.
      req.user = await User.findById(decoded.id).select('-password').populate('role');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error('Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * RBAC Middleware: Accepts an array of allowed roles and checks 
 * if the authenticated user's role has permission to proceed.
 * @param {Array} allowedRoles Array of role names (e.g., ['Admin', 'Kitchen Staff'])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: No role assigned' });
    }
    
    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Forbidden: Requires one of these roles: ${allowedRoles.join(', ')}` });
    }
    
    next();
  };
};

/**
 * Security Middleware: Prevents NoSQL Injection.
 * This can be used on specific routes or globally.
 */
const sanitizeInput = mongoSanitize();

module.exports = { protect, authorize, sanitizeInput };
