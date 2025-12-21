const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// --- NOTIFICATIONS ---

// Get My Notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark all as read
router.put('/notifications/read/:userId', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create Notification (Internal Use or Admin)
router.post('/notify', async (req, res) => {
  try {
    const newNote = new Notification(req.body);
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- PROFILE SETTINGS ---

// Get Profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update Profile Info
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, address, bloodGroup, emergencyContact } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, bloodGroup, emergencyContact },
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Change Password
router.put('/profile/password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;