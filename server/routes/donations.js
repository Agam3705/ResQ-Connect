const express = require('express');
const router = express.Router();
const { Donation, Camp } = require('../models/Donation');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// --- DONATIONS ---
router.post('/pledge', verifyToken, asyncHandler(async (req, res) => {
  const donation = new Donation({ ...req.body, donorId: req.user.id });
  await donation.save();
  
  // Auto-match with nearest camp
  if (donation.location?.lat) {
    const camps = await Camp.find({ status: 'active' });
    // Simple distance matching - find camps needing these items
    const matchedCamp = camps.find(camp => 
      camp.needsItems.some(need => 
        donation.items.some(item => 
          item.category === need.category && need.quantityNeeded > 0
        )
      )
    );
    if (matchedCamp) {
      donation.matchedCamp = matchedCamp._id;
      donation.status = 'matched';
      await donation.save();
    }
  }
  
  res.status(201).json(donation);
}));

router.get('/', asyncHandler(async (req, res) => {
  const donations = await Donation.find()
    .populate('matchedCamp', 'name location')
    .sort({ createdAt: -1 });
  res.json(donations);
}));

router.get('/my/:userId', asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donorId: req.params.userId })
    .populate('matchedCamp', 'name location')
    .sort({ createdAt: -1 });
  res.json(donations);
}));

router.put('/:id/status', verifyToken, asyncHandler(async (req, res) => {
  const update = { status: req.body.status };
  if (req.body.status === 'delivered') update.deliveredAt = new Date();
  const donation = await Donation.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(donation);
}));

// --- CAMPS ---
router.get('/camps', asyncHandler(async (req, res) => {
  const camps = await Camp.find().populate('managedBy', 'name').sort({ createdAt: -1 });
  res.json(camps);
}));

router.post('/camps', verifyToken, requireRole('admin', 'agency'), asyncHandler(async (req, res) => {
  const camp = new Camp({ ...req.body, managedBy: req.user.id });
  await camp.save();
  res.status(201).json(camp);
}));

router.put('/camps/:id', verifyToken, requireRole('admin', 'agency'), asyncHandler(async (req, res) => {
  const camp = await Camp.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(camp);
}));

module.exports = router;
