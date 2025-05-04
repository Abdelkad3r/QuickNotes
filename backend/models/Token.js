const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verification'],
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Automatically delete documents after 30 days
  }
});

// Index for faster queries
TokenSchema.index({ user: 1, type: 1 });
TokenSchema.index({ token: 1 });

module.exports = mongoose.model('Token', TokenSchema);
