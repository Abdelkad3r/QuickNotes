const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Middleware to verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists'
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: 'User recently changed password. Please log in again'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please log in again'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your token has expired. Please log in again'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

/**
 * Restrict routes to specific roles
 * @param {Array} roles - Array of allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Verify email middleware
 * Only allows access if user's email is verified
 */
exports.verifyEmail = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email address before accessing this resource'
    });
  }

  next();
};
