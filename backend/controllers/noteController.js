const Note = require('../models/Note');
const User = require('../models/User');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    // Get query parameters
    const { category, tag, pinned, archived, search, sort } = req.query;

    // Build query
    const query = {
      $or: [
        { user: req.user.id }, // Notes owned by user
        { 'sharedWith.user': req.user.id } // Notes shared with user
      ]
    };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Filter by pinned status
    if (pinned !== undefined) {
      query.isPinned = pinned === 'true';
    }

    // Filter by archived status
    if (archived !== undefined) {
      query.isArchived = archived === 'true';
    } else {
      // By default, don't show archived notes
      query.isArchived = false;
    }

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    let sortOption = { updatedAt: -1 }; // Default: newest first

    if (sort === 'oldest') {
      sortOption = { updatedAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'category') {
      sortOption = { category: 1 };
    }

    // Execute query with sorting
    const notes = await Note.find(query)
      .sort(sortOption)
      .populate('sharedWith.user', 'username email');

    // Get unique categories for the user
    const categories = await Note.distinct('category', { user: req.user.id });

    // Get unique tags for the user
    const tags = await Note.distinct('tags', { user: req.user.id });

    res.json({
      success: true,
      count: notes.length,
      categories,
      tags,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('sharedWith.user', 'username email');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or if it's shared with them
    const isOwner = note.user.toString() === req.user.id;
    const isSharedWithUser = note.sharedWith.some(
      share => share.user._id.toString() === req.user.id
    );

    if (!isOwner && !isSharedWithUser) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    // Add permission info to the response
    const userPermission = isOwner
      ? 'owner'
      : note.sharedWith.find(share => share.user._id.toString() === req.user.id)?.permission;

    res.json({
      success: true,
      data: note,
      permission: userPermission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const note = await Note.create(req.body);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id)
      .populate('sharedWith.user', 'username email');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check if user owns the note or has write permission
    const isOwner = note.user.toString() === req.user.id;
    const sharedWithUser = note.sharedWith.find(
      share => share.user._id.toString() === req.user.id
    );
    const hasWritePermission = sharedWithUser && sharedWithUser.permission === 'write';

    if (!isOwner && !hasWritePermission) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this note'
      });
    }

    // If user is not the owner, they can only update content and title
    let updateData;
    if (isOwner) {
      // Owner can update all fields
      updateData = { ...req.body, updatedAt: Date.now() };
    } else {
      // Shared users with write permission can only update content and title
      const { title, content } = req.body;
      updateData = {
        title,
        content,
        updatedAt: Date.now()
      };
    }

    // Update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('sharedWith.user', 'username email');

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Only the owner can delete a note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Share a note with another user
// @route   POST /api/notes/:id/share
// @access  Private
exports.shareNote = async (req, res) => {
  try {
    const { email, permission } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    // Validate permission
    if (permission && !['read', 'write'].includes(permission)) {
      return res.status(400).json({
        success: false,
        error: 'Permission must be either "read" or "write"'
      });
    }

    // Find the note
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Only the owner can share this note'
      });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });

    if (!userToShare) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't share with yourself
    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot share a note with yourself'
      });
    }

    // Check if already shared with this user
    const alreadyShared = note.sharedWith.find(
      share => share.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      // Update permission if it's different
      if (alreadyShared.permission !== permission) {
        alreadyShared.permission = permission || 'read';
        await note.save();
      }

      return res.json({
        success: true,
        message: `Note already shared with ${email}, permission updated to ${permission || 'read'}`,
        data: note
      });
    }

    // Add user to sharedWith array
    note.sharedWith.push({
      user: userToShare._id,
      permission: permission || 'read'
    });

    await note.save();

    // Populate the user info
    await note.populate('sharedWith.user', 'username email');

    res.json({
      success: true,
      message: `Note shared with ${email}`,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove share access for a user
// @route   DELETE /api/notes/:id/share/:userId
// @access  Private
exports.removeShare = async (req, res) => {
  try {
    // Find the note
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Only the owner can modify sharing permissions'
      });
    }

    // Remove user from sharedWith array
    note.sharedWith = note.sharedWith.filter(
      share => share.user.toString() !== req.params.userId
    );

    await note.save();

    res.json({
      success: true,
      message: 'Share access removed',
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all categories for a user
// @route   GET /api/notes/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    // Get all unique categories for the user's notes
    const categories = await Note.distinct('category', { user: req.user.id });

    // Count notes in each category
    const categoryCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Note.countDocuments({
          user: req.user.id,
          category,
          isArchived: false
        });

        return {
          name: category,
          count
        };
      })
    );

    res.json({
      success: true,
      count: categories.length,
      data: categoryCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all tags for a user
// @route   GET /api/notes/tags
// @access  Private
exports.getTags = async (req, res) => {
  try {
    // Get all unique tags for the user's notes
    const tags = await Note.distinct('tags', { user: req.user.id });

    // Count notes with each tag
    const tagCounts = await Promise.all(
      tags.map(async (tag) => {
        const count = await Note.countDocuments({
          user: req.user.id,
          tags: tag,
          isArchived: false
        });

        return {
          name: tag,
          count
        };
      })
    );

    res.json({
      success: true,
      count: tags.length,
      data: tagCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get note statistics
// @route   GET /api/notes/stats
// @access  Private
exports.getNoteStats = async (req, res) => {
  try {
    // Total notes count
    const totalNotes = await Note.countDocuments({ user: req.user.id });

    // Active notes (not archived)
    const activeNotes = await Note.countDocuments({
      user: req.user.id,
      isArchived: false
    });

    // Archived notes
    const archivedNotes = await Note.countDocuments({
      user: req.user.id,
      isArchived: true
    });

    // Pinned notes
    const pinnedNotes = await Note.countDocuments({
      user: req.user.id,
      isPinned: true,
      isArchived: false
    });

    // Shared notes (notes shared with others)
    const sharedWithOthers = await Note.countDocuments({
      user: req.user.id,
      sharedWith: { $exists: true, $not: { $size: 0 } }
    });

    // Notes shared with me
    const sharedWithMe = await Note.countDocuments({
      'sharedWith.user': req.user.id
    });

    // Category counts
    const categories = await Note.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most recent note
    const mostRecentNote = await Note.findOne({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt');

    // Oldest note
    const oldestNote = await Note.findOne({ user: req.user.id })
      .sort({ createdAt: 1 })
      .select('title createdAt');

    res.json({
      success: true,
      data: {
        totalNotes,
        activeNotes,
        archivedNotes,
        pinnedNotes,
        sharedWithOthers,
        sharedWithMe,
        categories: categories.map(c => ({ name: c._id, count: c.count })),
        mostRecentNote,
        oldestNote
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
