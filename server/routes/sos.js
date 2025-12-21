const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const User = require('../models/User');

// 1. CREATE SOS
router.post('/create', async (req, res) => {
  try {
    const { userId, userName, location, type, priority } = req.body;
    
    const newSOS = new SOS({
      userId,
      userName,
      location,
      type: type || 'general',
      priority: priority || 'high',
      status: 'active'
    });

    await newSOS.save();
    res.status(201).json(newSOS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ACTIVE SOS ALERTS
router.get('/active', async (req, res) => {
  try {
    // Only return alerts that are NOT resolved
    const activeAlerts = await SOS.find({ status: 'active' });
    res.json(activeAlerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. RESOLVE SOS (Mark as Safe)
router.post('/resolve', async (req, res) => {
  try {
    const { sosId } = req.body;
    
    // Find the alert and update status to 'resolved'
    const updatedSOS = await SOS.findByIdAndUpdate(
      sosId,
      { 
        status: 'resolved', 
        resolvedAt: new Date() 
      },
      { new: true } // Return the updated document
    );

    if (!updatedSOS) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(updatedSOS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const { type, details, infants, elderly } = req.body;
    
    const updatedSOS = await SOS.findByIdAndUpdate(
      req.params.id,
      { 
        type: type || 'general',
        details: details || '',
        peopleCount: { infants, elderly }
      },
      { new: true }
    );
    res.json(updatedSOS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
