const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  removeShare,
  getCategories,
  getTags,
  getNoteStats
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats, categories, and tags routes
router.get('/stats', getNoteStats);
router.get('/categories', getCategories);
router.get('/tags', getTags);

// Note CRUD routes
router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

// Note sharing routes
router.route('/:id/share')
  .post(shareNote);

router.route('/:id/share/:userId')
  .delete(removeShare);

module.exports = router;
