const express = require('express');
const router = express.Router();
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
    const hazards = await Hazard.find().sort({ timestamp: -1 });
    res.json(hazards);
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

// --- RUMORS ---
router.get('/rumors', async (req, res) => {
  try {
    const rumors = await Rumor.find().sort({ createdAt: -1 });
    res.json(rumors);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rumors/vote', async (req, res) => {
  try {
    const { id, vote } = req.body; // vote = 'true' or 'false'
    const update = vote === 'true' ? { $inc: { votesTrue: 1 } } : { $inc: { votesFalse: 1 } };
    const updatedRumor = await Rumor.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedRumor);
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