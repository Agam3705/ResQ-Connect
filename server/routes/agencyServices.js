const express = require('express');
const router = express.Router();
const AgencyService = require('../models/AgencyService');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET all active services (public)
router.get('/', asyncHandler(async (req, res) => {
  const services = await AgencyService.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(services);
}));

// POST new service (agency only)
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'agency') return res.status(403).json({ message: 'Agencies only' });
  
  // Robustness: ensure we have a name
  let name = req.user.name;
  if (!name) {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    name = user?.name || 'Unknown Agency';
  }

  const service = new AgencyService({
    ...req.body,
    agencyId: req.user.id,
    agencyName: name
  });
  await service.save();
  res.status(201).json(service);
}));

// PUT (edit) service (agency owner only)
router.put('/:id', verifyToken, asyncHandler(async (req, res) => {
  const service = await AgencyService.findById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Not found' });
  if (service.agencyId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  const updated = await AgencyService.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
}));

// DELETE service (agency owner only)
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const service = await AgencyService.findById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Not found' });
  if (service.agencyId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  await AgencyService.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
