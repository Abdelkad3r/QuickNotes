const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.post('/resend-verification', protect, resendVerification);
router.post('/setup-2fa', protect, setupTwoFactor);
router.post('/verify-2fa', protect, verifyTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);

module.exports = router;
