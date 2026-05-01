const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET AVAILABLE VEHICLES
router.get('/available', asyncHandler(async (req, res) => {
  const transports = await Transport.find({ status: 'available' }).sort({ createdAt: -1 });
  res.json(transports);
}));

// GET ALL
router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const transports = await Transport.find(query).sort({ createdAt: -1 });
  res.json(transports);
}));

// FLAG VEHICLE AS AVAILABLE
router.post('/flag', verifyToken, asyncHandler(async (req, res) => {
  const transport = new Transport({ ...req.body, driverId: req.user.id });
  await transport.save();
  res.status(201).json(transport);
}));

// REQUEST PICKUP
router.post('/request/:id', verifyToken, asyncHandler(async (req, res) => {
  const transport = await Transport.findByIdAndUpdate(
    req.params.id,
    { status: 'assigned', assignedTo: req.user.id },
    { new: true }
  );
  res.json(transport);
}));

// UPDATE STATUS
router.put('/:id/status', verifyToken, asyncHandler(async (req, res) => {
  const transport = await Transport.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true }
  );
  res.json(transport);
}));

// MY TRANSPORTS
router.get('/my/:userId', asyncHandler(async (req, res) => {
  const transports = await Transport.find({ driverId: req.params.userId }).sort({ createdAt: -1 });
  res.json(transports);
}));

// UPDATE TRANSPORT
router.put('/:id', verifyToken, asyncHandler(async (req, res) => {
  const transport = await Transport.findById(req.params.id);
  if (!transport) return res.status(404).json({ message: 'Not found' });
  if (transport.driverId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const updated = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
}));

// DELETE TRANSPORT
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const transport = await Transport.findById(req.params.id);
  if (!transport) return res.status(404).json({ message: 'Not found' });
  if (transport.driverId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await Transport.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
