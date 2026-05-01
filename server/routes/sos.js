const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// CREATE SOS - no auth required (emergencies must always work)
router.post('/create', asyncHandler(async (req, res) => {
  const { userId, userName, location, type, priority, details, disasterId } = req.body;
  
  if (!userId || !userName || !location?.lat || !location?.lng) {
    return res.status(400).json({ message: 'userId, userName and location are required' });
  }

  const newSOS = new SOS({
    userId, userName, location,
    type: type || 'general',
    priority: priority || 'high',
    details: details || '',
    disasterId,
    status: 'active'
  });

  await newSOS.save();

  // Notify all approved agencies
  try {
    const agencies = await User.find({ 
      role: 'agency', 
      'agencyDetails.status': 'approved', 
      isActive: { $ne: false } 
    }).select('_id');
    
    if (agencies.length > 0) {
      const notifications = agencies.map(a => ({
        userId: a._id,
        title: '🚨 New SOS Alert',
        message: `${userName} needs ${type || 'general'} help. Priority: ${priority || 'high'}`,
        type: 'alert'
      }));
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error('Failed to send SOS notifications:', notifErr.message);
  }

  res.status(201).json(newSOS);
}));

// GET ACTIVE SOS - no auth required (dashboard needs this on load)
router.get('/active', asyncHandler(async (req, res) => {
  const activeAlerts = await SOS.find({ 
    status: { $in: ['active', 'assigned', 'in-progress'] } 
  }).sort({ createdAt: -1 }).limit(100);
  res.json(activeAlerts);
}));

// GET ALL SOS (with filters)
router.get('/all', asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 50 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  
  const sos = await SOS.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await SOS.countDocuments(query);
  res.json({ sos, total });
}));

// ASSIGN SOS TO AGENCY (requires auth)
router.put('/assign/:id', verifyToken, asyncHandler(async (req, res) => {
  const { agencyId, agencyName, notes } = req.body;
  const updated = await SOS.findByIdAndUpdate(
    req.params.id,
    { 
      assignedAgency: agencyId,
      assignedAgencyName: agencyName,
      responderNotes: notes,
      status: 'assigned',
      assignedAt: new Date()
    },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: 'SOS not found' });

  // Notify the civilian
  try {
    await new Notification({
      userId: updated.userId,
      title: '🏥 Help Assigned',
      message: `${agencyName || 'An agency'} is responding to your SOS!`,
      type: 'success'
    }).save();
  } catch (e) {}

  res.json(updated);
}));

// UPDATE SOS STATUS (requires auth)
router.put('/status/:id', verifyToken, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const update = { status };
  if (notes) update.responderNotes = notes;
  if (status === 'resolved') update.resolvedAt = new Date();
  
  const updated = await SOS.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!updated) return res.status(404).json({ message: 'SOS not found' });
  res.json(updated);
}));

// RESOLVE SOS (no auth - civilian must be able to mark safe)
router.post('/resolve', asyncHandler(async (req, res) => {
  const { sosId } = req.body;
  if (!sosId) return res.status(400).json({ message: 'sosId required' });
  
  const updatedSOS = await SOS.findByIdAndUpdate(
    sosId,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  );
  if (!updatedSOS) return res.status(404).json({ message: 'Alert not found' });
  res.json(updatedSOS);
}));

// UPDATE SOS DETAILS (no auth - civilian updating their own SOS)
router.put('/update/:id', asyncHandler(async (req, res) => {
  const { type, details, infants, elderly, count } = req.body;
  const updatedSOS = await SOS.findByIdAndUpdate(
    req.params.id,
    { 
      type: type || 'general', 
      details: details || '', 
      peopleCount: { infants, elderly, count } 
    },
    { new: true }
  );
  if (!updatedSOS) return res.status(404).json({ message: 'SOS not found' });
  res.json(updatedSOS);
}));

module.exports = router;
