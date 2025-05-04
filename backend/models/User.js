const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User preferences schema
const PreferencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  defaultView: {
    type: String,
    enum: ['list', 'grid'],
    default: 'list'
  },
  defaultSort: {
    type: String,
    enum: ['newest', 'oldest', 'title', 'category'],
    default: 'newest'
  },
  defaultCategory: {
    type: String,
    default: 'Uncategorized'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  showDateCreated: {
    type: Boolean,
    default: true
  },
  showDateUpdated: {
    type: Boolean,
    default: true
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: false
    },
    sharedNotes: {
      type: Boolean,
      default: true
    }
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      select: false
    },
    backupCodes: {
      type: [String],
      select: false
    }
  },
  oauthProfiles: [{
    provider: {
      type: String,
      enum: ['google', 'github', 'facebook']
    },
    providerId: {
      type: String
    },
    data: {
      type: Object
    }
  }],
  preferences: {
    type: PreferencesSchema,
    default: () => ({})
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters']
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after token was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Set passwordChangedAt field when password is modified
UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  // Set passwordChangedAt to current time minus 1 second
  // This ensures the token is created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model('User', UserSchema);
