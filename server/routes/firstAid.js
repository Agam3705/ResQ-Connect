const express = require('express');
const router = express.Router();
const FirstAidNote = require('../models/FirstAidNote');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET all notes (public)
router.get('/', asyncHandler(async (req, res) => {
  const notes = await FirstAidNote.find().sort({ createdAt: -1 });
  res.json(notes);
}));

// ADD note (admin only)
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const note = new FirstAidNote(req.body);
  await note.save();
  res.status(201).json(note);
}));

// EDIT note (admin only)
router.put('/:id', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const updated = await FirstAidNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
}));

// DELETE note (admin only)
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  await FirstAidNote.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
