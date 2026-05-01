const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET ALL HOSPITALS
router.get('/', asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ status: { $ne: 'closed' } })
    .populate('managedBy', 'name agencyDetails.agencyName')
    .sort({ name: 1 });
  res.json(hospitals);
}));

// GET SINGLE HOSPITAL
router.get('/:id', asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id).populate('managedBy', 'name');
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
  res.json(hospital);
}));

// CREATE HOSPITAL (admin/agency)
router.post('/', verifyToken, requireRole('admin', 'agency'), asyncHandler(async (req, res) => {
  const hospital = new Hospital({ ...req.body, managedBy: req.user.id });
  await hospital.save();
  res.status(201).json(hospital);
}));

// UPDATE BED COUNT (agency)
router.put('/:id/beds', verifyToken, requireRole('admin', 'agency'), asyncHandler(async (req, res) => {
  const { wards } = req.body;
  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    { wards, lastUpdated: new Date() },
    { new: true }
  );
  res.json(hospital);
}));

// UPDATE STATUS
router.put('/:id/status', verifyToken, requireRole('admin', 'agency'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id, { status: req.body.status, lastUpdated: new Date() }, { new: true }
  );
  res.json(hospital);
}));

// DELETE
router.delete('/:id', verifyToken, requireRole('admin'), asyncHandler(async (req, res) => {
  await Hospital.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
