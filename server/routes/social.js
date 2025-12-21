const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GlobalMessage = require('../models/GlobalMessage');
const AgencyUpdate = require('../models/AgencyUpdate');

// --- GLOBAL CHAT ---
router.get('/chat', async (req, res) => {
  try {
    const messages = await GlobalMessage.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/chat', async (req, res) => {
  try {
    const newMessage = new GlobalMessage(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- AGENCY HUB ---
// Get All Agencies
router.get('/agencies', async (req, res) => {
  try {
    // Find users with role 'agency'
    const agencies = await User.find({ role: 'agency' }).select('name email agencyDetails');
    res.json(agencies);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get Agency Updates
router.get('/updates', async (req, res) => {
  try {
    const updates = await AgencyUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Post Update (For Agency Admins)
router.post('/updates', async (req, res) => {
  try {
    const newUpdate = new AgencyUpdate(req.body);
    await newUpdate.save();
    res.status(201).json(newUpdate);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;