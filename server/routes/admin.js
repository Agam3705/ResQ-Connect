const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');
const User = require('../models/User');
const SOS = require('../models/SOS');
const Disaster = require('../models/Disaster');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const Rumor = require('../models/Rumor');
const MissingPerson = require('../models/MissingPerson');
const Hazard = require('../models/Hazard');
const HelpOffer = require('../models/HelpOffer');

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

// 1. SYSTEM STATS
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers, totalCivilians, totalAgencies,
    pendingAgencies, activeSOS, totalDisasters,
    activeDisasters, totalResources, totalMissing,
    activeMissing, totalHazards, totalVolunteers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'civilian' }),
    User.countDocuments({ role: 'agency' }),
    User.countDocuments({ role: 'agency', 'agencyDetails.status': 'pending' }),
    SOS.countDocuments({ status: { $in: ['active', 'assigned', 'in-progress'] } }),
    Disaster.countDocuments(),
    Disaster.countDocuments({ status: 'active' }),
    Resource.countDocuments(),
    MissingPerson.countDocuments(),
    MissingPerson.countDocuments({ status: 'missing' }),
    Hazard.countDocuments(),
    HelpOffer.countDocuments()
  ]);

  // SOS by type
  const sosByType = await SOS.aggregate([
    { $match: { status: { $ne: 'resolved' } } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // SOS over last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sosOverTime = await SOS.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Recent activity
  const recentSOS = await SOS.find().sort({ createdAt: -1 }).limit(5);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');

  res.json({
    overview: {
      totalUsers, totalCivilians, totalAgencies,
      pendingAgencies, activeSOS, activeDisasters,
      totalResources, activeMissing, totalHazards, totalVolunteers
    },
    charts: { sosByType, sosOverTime },
    recent: { recentSOS, recentUsers }
  });
}));

// 2. USER MANAGEMENT
router.get('/users', asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 50, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);
  res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
}));

router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['civilian', 'agency', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  res.json(user);
}));

router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
  res.json(user);
}));

// 3. AGENCY VERIFICATION
router.get('/pending-agencies', asyncHandler(async (req, res) => {
  const agencies = await User.find({ role: 'agency', 'agencyDetails.status': 'pending' }).select('-password');
  res.json(agencies);
}));

router.put('/approve/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 'agencyDetails.status': 'approved' },
    { new: true }
  ).select('-password');
  
  // Send notification
  await new Notification({
    userId: req.params.id,
    title: 'Agency Approved',
    message: 'Your agency has been approved! You now have full access.',
    type: 'success'
  }).save();
  
  res.json(user);
}));

router.put('/reject/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 'agencyDetails.status': 'rejected' },
    { new: true }
  ).select('-password');
  
  await new Notification({
    userId: req.params.id,
    title: 'Agency Rejected',
    message: 'Your agency application has been rejected. Contact admin for details.',
    type: 'alert'
  }).save();
  
  res.json(user);
}));

// 4. DISASTER MANAGEMENT
router.get('/disasters', asyncHandler(async (req, res) => {
  const disasters = await Disaster.find()
    .populate('assignedAgencies', 'name agencyDetails.type')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json(disasters);
}));

router.post('/disasters', asyncHandler(async (req, res) => {
  const disaster = new Disaster({ ...req.body, createdBy: req.user.id });
  await disaster.save();
  
  // Broadcast notification to all users
  const users = await User.find({ isActive: true }).select('_id');
  const notifications = users.map(u => ({
    userId: u._id,
    title: `⚠️ Disaster Alert: ${req.body.name}`,
    message: `${req.body.type.toUpperCase()} declared in ${req.body.location.name}. Severity: ${req.body.severity}`,
    type: 'alert'
  }));
  await Notification.insertMany(notifications);
  
  res.status(201).json(disaster);
}));

router.put('/disasters/:id', asyncHandler(async (req, res) => {
  const disaster = await Disaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(disaster);
}));

router.put('/disasters/:id/close', asyncHandler(async (req, res) => {
  const disaster = await Disaster.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  );
  res.json(disaster);
}));

// 5. BROADCAST
router.post('/broadcast', asyncHandler(async (req, res) => {
  const { title, message, severity, targetRole } = req.body;
  const query = { isActive: true };
  if (targetRole && targetRole !== 'all') query.role = targetRole;
  
  const users = await User.find(query).select('_id');
  const notifications = users.map(u => ({
    userId: u._id, title, message,
    type: severity === 'critical' ? 'alert' : 'info'
  }));
  await Notification.insertMany(notifications);

  // Also post to global community chat
  const GlobalMessage = require('../models/GlobalMessage');
  await new GlobalMessage({
    userId: req.user.id,
    userName: '📢 ADMIN BROADCAST',
    text: `[${severity?.toUpperCase() || 'INFO'}] ${title}: ${message}`
  }).save();

  res.json({ message: `Broadcast sent to ${users.length} users` });
}));

// 6. RUMOR MODERATION
router.get('/rumors', asyncHandler(async (req, res) => {
  const rumors = await Rumor.find().sort({ createdAt: -1 });
  res.json(rumors);
}));

router.put('/rumors/:id/verify', asyncHandler(async (req, res) => {
  const { adminStatus } = req.body;
  const rumor = await Rumor.findByIdAndUpdate(req.params.id, { adminStatus }, { new: true });
  res.json(rumor);
}));

router.post('/rumors', asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const newRumor = new Rumor({ title, description, adminStatus: 'pending' });
  await newRumor.save();
  res.status(201).json(newRumor);
}));

router.delete('/rumors/:id', asyncHandler(async (req, res) => {
  await Rumor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Rumor poll deleted' });
}));

// 7. ALL SOS (for oversight)
router.get('/sos', asyncHandler(async (req, res) => {
  const sos = await SOS.find().sort({ createdAt: -1 }).limit(100);
  res.json(sos);
}));

// 8. VOLUNTEERS / HELP OFFERS
router.get('/volunteers', asyncHandler(async (req, res) => {
  const volunteers = await HelpOffer.find().sort({ createdAt: -1 });
  res.json(volunteers);
}));

module.exports = router;