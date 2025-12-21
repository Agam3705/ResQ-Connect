const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is admin (You should add your verifyToken here)
// const { verifyToken, isAdmin } = require('../middleware/auth'); 

// 1. GET ALL PENDING AGENCIES
router.get('/pending-agencies', async (req, res) => {
  try {
    const agencies = await User.find({ role: 'agency', status: 'pending' });
    res.json(agencies);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. APPROVE AGENCY
router.put('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. REJECT AGENCY
router.put('/reject/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;