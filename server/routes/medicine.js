const express = require('express');
const router = express.Router();
const MedicineRequest = require('../models/MedicineRequest');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET ALL (with filters)
router.get('/', asyncHandler(async (req, res) => {
  const { type, category, status = 'active' } = req.query;
  const query = { status };
  if (type) query.type = type;
  if (category) query.category = category;
  
  const requests = await MedicineRequest.find(query)
    .sort({ urgency: -1, createdAt: -1 });
  res.json(requests);
}));

// CREATE REQUEST/OFFER
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const request = new MedicineRequest({ ...req.body, userId: req.user.id });
  await request.save();
  res.status(201).json(request);
}));

// FULFILL
router.put('/:id/fulfill', verifyToken, asyncHandler(async (req, res) => {
  const request = await MedicineRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'fulfilled', fulfilledBy: req.user.id },
    { new: true }
  );
  res.json(request);
}));

// MY REQUESTS
router.get('/my/:userId', asyncHandler(async (req, res) => {
  const requests = await MedicineRequest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(requests);
}));

// CLOSE (remove from board, keep data)
router.put('/:id/close', verifyToken, asyncHandler(async (req, res) => {
  const post = await MedicineRequest.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not your post' });
  }
  post.status = post.status === 'closed' ? 'active' : 'closed';
  await post.save();
  res.json(post);
}));

// DELETE (own only)
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const post = await MedicineRequest.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not your post' });
  }
  await MedicineRequest.findByIdAndDelete(req.params.id);
  const Comment = require('../models/Comment');
  await Comment.deleteMany({ postId: req.params.id, postType: 'medicine' });
  res.json({ message: 'Deleted' });
}));

module.exports = router;

