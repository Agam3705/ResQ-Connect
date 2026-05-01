const express = require('express');
const router = express.Router();
const AgencyChat = require('../models/AgencyChat');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET MESSAGES
router.get('/', asyncHandler(async (req, res) => {
  const messages = await AgencyChat.find().sort({ createdAt: 1 }).limit(200);
  res.json(messages);
}));

// SEND MESSAGE (agencies only)
router.post('/', verifyToken, requireRole('agency', 'admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const message = new AgencyChat({
    senderId: req.user.id,
    senderName: user.name,
    agencyName: user.agencyDetails?.agencyName || user.name,
    text: req.body.text,
    type: req.body.type || 'message'
  });
  await message.save();
  res.status(201).json(message);
}));

module.exports = router;
