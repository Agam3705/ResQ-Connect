const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const User = require('../models/User');
const Message = require('../models/Message');

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// --- 1. GET ALL MY FAMILIES (The Lobby) ---
router.get('/my-families/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('civilianDetails.joinedFamilies');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Return the array of families
    res.json(user.civilianDetails.joinedFamilies || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. GET SINGLE FAMILY DETAILS (The Room) ---
router.get('/details/:familyId', async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId)
      .populate('members', 'name email role lastLocation'); // Include Location
    res.json(family);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. CREATE FAMILY ---
router.post('/create', async (req, res) => {
  try {
    const { userId, name } = req.body;
    const code = generateCode();
    
    // Create Family
    const newFamily = new Family({ name, joinCode: code, admin: userId, members: [userId] });
    await newFamily.save();

    // Add to User's List
    await User.findByIdAndUpdate(userId, { 
      $push: { 'civilianDetails.joinedFamilies': newFamily._id } 
    });

    res.status(201).json(newFamily);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 4. JOIN FAMILY ---
router.post('/join', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const family = await Family.findOne({ joinCode: code });
    if (!family) return res.status(404).json({ message: 'Invalid Code' });

    // Add User to Family Member List (if not already there)
    if (!family.members.includes(userId)) {
      family.members.push(userId);
      await family.save();
    }

    // Add Family to User's List (if not already there)
    const user = await User.findById(userId);
    if (!user.civilianDetails.joinedFamilies.includes(family._id)) {
      user.civilianDetails.joinedFamilies.push(family._id);
      await user.save();
    }

    res.json(family);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. CHAT & LOCATION ---
router.post('/message', async (req, res) => {
  try {
    const { familyId, senderName, text } = req.body;
    const newMessage = new Message({ familyId, senderName, text });
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/messages/:familyId', async (req, res) => {
  try {
    const messages = await Message.find({ familyId: req.params.familyId }).sort({ createdAt: 1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/location', async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;
    await User.findByIdAndUpdate(userId, {
      'lastLocation': { lat, lng, updatedAt: new Date() }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;