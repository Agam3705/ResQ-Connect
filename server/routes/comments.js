const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET comments for a post
router.get('/:postType/:postId', asyncHandler(async (req, res) => {
  const { postType, postId } = req.params;
  const comments = await Comment.find({ postId, postType })
    .sort({ createdAt: 1 })
    .limit(100);
  res.json(comments);
}));

// POST a comment
router.post('/:postType/:postId', verifyToken, asyncHandler(async (req, res) => {
  const { postType, postId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Text required' });

  const User = require('../models/User');
  const user = await User.findById(req.user.id).select('name role');

  const comment = new Comment({
    postId, postType,
    userId: req.user.id,
    userName: user.name,
    userRole: user.role,
    text: text.trim()
  });
  await comment.save();
  res.status(201).json(comment);
}));

// DELETE own comment
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Not found' });
  if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not your comment' });
  }
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
