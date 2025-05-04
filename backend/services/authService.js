const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('../models/Token');
const User = require('../models/User');

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh token
 */
const generateRefreshToken = async (user) => {
  // Generate a random token
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Calculate expiry date (30 days from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  // Save the refresh token in the database
  await Token.create({
    user: user._id,
    token: refreshToken,
    type: 'refresh',
    expires: expiryDate
  });
  
  return refreshToken;
};

/**
 * Verify refresh token and generate new access token
 * @param {String} refreshToken - Refresh token
 * @returns {Object} Object containing new access token and user info
 */
const refreshAccessToken = async (refreshToken) => {
  // Find the token in the database
  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: 'refresh',
    blacklisted: false,
    expires: { $gt: new Date() }
  });
  
  if (!tokenDoc) {
    throw new Error('Invalid or expired refresh token');
  }
  
  // Get the user
  const user = await User.findById(tokenDoc.user);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate a new access token
  const accessToken = generateAccessToken(user);
  
  return {
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Blacklist a refresh token (used for logout)
 * @param {String} refreshToken - Refresh token to blacklist
 */
const blacklistToken = async (refreshToken) => {
  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: 'refresh'
  });
  
  if (tokenDoc) {
    tokenDoc.blacklisted = true;
    await tokenDoc.save();
  }
};

/**
 * Generate a verification token for email verification
 * @param {Object} user - User object
 * @returns {String} Verification token
 */
const generateVerificationToken = async (user) => {
  // Generate a random token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry date (24 hours from now)
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  
  // Save the verification token in the database
  await Token.create({
    user: user._id,
    token: verificationToken,
    type: 'verification',
    expires: expiryDate
  });
  
  return verificationToken;
};

/**
 * Verify email with verification token
 * @param {String} token - Verification token
 * @returns {Object} User object
 */
const verifyEmail = async (token) => {
  // Find the token in the database
  const tokenDoc = await Token.findOne({
    token,
    type: 'verification',
    blacklisted: false,
    expires: { $gt: new Date() }
  });
  
  if (!tokenDoc) {
    throw new Error('Invalid or expired verification token');
  }
  
  // Get the user and mark email as verified
  const user = await User.findById(tokenDoc.user);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  user.isEmailVerified = true;
  await user.save();
  
  // Blacklist the token
  tokenDoc.blacklisted = true;
  await tokenDoc.save();
  
  return user;
};

/**
 * Generate a password reset token
 * @param {Object} user - User object
 * @returns {String} Reset token
 */
const generateResetToken = async (user) => {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry date (1 hour from now)
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);
  
  // Save the reset token in the database
  await Token.create({
    user: user._id,
    token: resetToken,
    type: 'reset',
    expires: expiryDate
  });
  
  return resetToken;
};

/**
 * Reset password with reset token
 * @param {String} token - Reset token
 * @param {String} newPassword - New password
 * @returns {Object} User object
 */
const resetPassword = async (token, newPassword) => {
  // Find the token in the database
  const tokenDoc = await Token.findOne({
    token,
    type: 'reset',
    blacklisted: false,
    expires: { $gt: new Date() }
  });
  
  if (!tokenDoc) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Get the user and update password
  const user = await User.findById(tokenDoc.user);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  user.password = newPassword;
  await user.save();
  
  // Blacklist the token
  tokenDoc.blacklisted = true;
  await tokenDoc.save();
  
  // Blacklist all refresh tokens for this user
  await Token.updateMany(
    { user: user._id, type: 'refresh' },
    { blacklisted: true }
  );
  
  return user;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  blacklistToken,
  generateVerificationToken,
  verifyEmail,
  generateResetToken,
  resetPassword
};
