const User = require('../models/User');
const Token = require('../models/Token');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: userExists.email === email 
          ? 'Email already in use' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate verification token
    const verificationToken = await authService.generateVerificationToken(user);
    
    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    // Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = await authService.generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password +twoFactorAuth.secret');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth.enabled) {
      // If 2FA code is not provided, return a challenge
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required'
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1 // Allow 1 period before and after
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          error: 'Invalid two-factor authentication code'
        });
      }
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = await authService.generateRefreshToken(user);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        preferences: user.preferences,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Refresh the access token
    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Blacklist the refresh token
      await authService.blacklistToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the email
    const user = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = await authService.generateVerificationToken(user);
    
    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email address'
      });
    }

    // Generate reset token
    const resetToken = await authService.generateResetToken(user);
    
    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a new password'
      });
    }

    // Reset the password
    const user = await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Setup two-factor authentication
 * @route   POST /api/auth/setup-2fa
 * @access  Private
 */
exports.setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `QuickNotes:${user.email}`
    });

    // Save the secret to the user
    user.twoFactorAuth.secret = secret.base32;
    await user.save({ validateBeforeSave: false });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Verify and enable two-factor authentication
 * @route   POST /api/auth/verify-2fa
 * @access  Private
 */
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a verification token'
      });
    }

    const user = await User.findById(req.user.id).select('+twoFactorAuth.secret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    
    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex'));
    }
    user.twoFactorAuth.backupCodes = backupCodes;
    
    await user.save();

    res.json({
      success: true,
      message: 'Two-factor authentication enabled',
      backupCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Disable two-factor authentication
 * @route   POST /api/auth/disable-2fa
 * @access  Private
 */
exports.disableTwoFactor = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Disable 2FA
    user.twoFactorAuth.enabled = false;
    user.twoFactorAuth.secret = undefined;
    user.twoFactorAuth.backupCodes = [];
    
    await user.save();

    res.json({
      success: true,
      message: 'Two-factor authentication disabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
