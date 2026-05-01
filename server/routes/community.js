const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Hazard = require('../models/Hazard');
const HelpOffer = require('../models/HelpOffer');
const Rumor = require('../models/Rumor');

// --- HAZARDS ---
router.post('/hazard', async (req, res) => {
  try {
    const newHazard = new Hazard(req.body);
    await newHazard.save();
    res.status(201).json(newHazard);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/hazards', async (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' ? {} : { approvalStatus: { $ne: 'rejected' } };
    const hazards = await Hazard.find(query).sort({ timestamp: -1 });
    res.json(hazards);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/hazard/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const hazard = await Hazard.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    res.json(hazard);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- HELP OFFERS ---
router.post('/help', async (req, res) => {
  try {
    const newOffer = new HelpOffer(req.body);
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/help-offers', async (req, res) => {
  try {
    const offers = await HelpOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RUMORS ---
router.get('/rumors', async (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' ? {} : { adminStatus: { $ne: 'debunked' } };
    const rumors = await Rumor.find(query).sort({ createdAt: -1 });
    res.json(rumors);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rumors/vote', verifyToken, async (req, res) => {
  try {
    const { id, vote } = req.body; // vote = 'true' or 'false'
    const rumor = await Rumor.findById(id);
    if (!rumor) return res.status(404).json({ message: 'Rumor not found' });
    
    // Check if user already voted
    const existingVoteIndex = rumor.voters.findIndex(v => v.userId === req.user.id);
    if (existingVoteIndex !== -1) {
      rumor.voters[existingVoteIndex].vote = vote;
    } else {
      rumor.voters.push({ userId: req.user.id, vote });
    }
    
    await rumor.save();
    res.json(rumor);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SEED ROUTE (Optional: Run this once to create dummy rumors for testing)
router.post('/rumors/seed', async (req, res) => {
  await Rumor.create([
    { title: "Dam burst in North District", description: "Reports saying the main dam has cracked.", adminStatus: 'debunked' },
    { title: "Free food at City Center", description: "Army distributing rations at 5 PM.", adminStatus: 'verified' }
  ]);
  res.json({ msg: "Seeded" });
});

module.exports = router;