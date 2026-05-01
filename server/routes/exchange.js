const express = require('express');
const router = express.Router();
const ResourceRequest = require('../models/ResourceRequest');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// GET ALL RESOURCE BOARD (open requests + surplus visible to all agencies)
router.get('/board', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { status: { $in: ['open', 'pending'] } };
  if (type) query.type = type;
  
  const requests = await ResourceRequest.find(query)
    .populate('fromAgency', 'name agencyDetails.agencyName agencyDetails.type')
    .sort({ urgency: -1, createdAt: -1 });
  res.json(requests);
}));

// CREATE REQUEST OR SURPLUS POST
router.post('/', verifyToken, requireRole('agency', 'admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const request = new ResourceRequest({
    ...req.body,
    fromAgency: req.user.id,
    fromAgencyName: user.name
  });
  await request.save();
  res.status(201).json(request);
}));

// GET MY REQUESTS (sent by me)
router.get('/my/:agencyId', asyncHandler(async (req, res) => {
  const requests = await ResourceRequest.find({ fromAgency: req.params.agencyId })
    .sort({ createdAt: -1 });
  res.json(requests);
}));

// GET INCOMING REQUESTS (targeted to me)
router.get('/incoming/:agencyId', asyncHandler(async (req, res) => {
  const requests = await ResourceRequest.find({ toAgency: req.params.agencyId, status: 'pending' })
    .populate('fromAgency', 'name agencyDetails')
    .sort({ createdAt: -1 });
  res.json(requests);
}));

// RESPOND TO REQUEST
router.put('/:id/respond', verifyToken, requireRole('agency', 'admin'), asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const user = await User.findById(req.user.id);
  
  const update = {
    status,
    respondedBy: req.user.id,
    respondedAt: new Date()
  };
  
  // If someone claims an open request
  if (status === 'approved' || status === 'pending') {
    update.toAgency = req.user.id;
    update.toAgencyName = user.name;
  }
  
  const request = await ResourceRequest.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(request);
}));

// FULFILL
router.put('/:id/fulfill', verifyToken, asyncHandler(async (req, res) => {
  const request = await ResourceRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'fulfilled', fulfilledAt: new Date() },
    { new: true }
  );
  res.json(request);
}));

// GET NEARBY AGENCIES WITH STOCK
router.get('/nearby-stock', asyncHandler(async (req, res) => {
  const agencies = await User.find({ 
    role: 'agency', 
    'agencyDetails.status': 'approved',
    isActive: true 
  }).select('name agencyDetails lastLocation');
  
  // Get resource counts per agency
  const agencyIds = agencies.map(a => a._id);
  const resources = await Resource.aggregate([
    { $match: { agencyId: { $in: agencyIds }, status: 'stored' } },
    { $group: { _id: '$agencyId', items: { $push: { name: '$name', category: '$category', quantity: '$quantity' } }, totalItems: { $sum: '$quantity' } } }
  ]);
  
  const resourceMap = {};
  resources.forEach(r => { resourceMap[r._id.toString()] = r; });
  
  const result = agencies.map(a => ({
    ...a.toObject(),
    stock: resourceMap[a._id.toString()] || { items: [], totalItems: 0 }
  }));
  
  res.json(result);
}));

// DELETE OWN POST
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const post = await ResourceRequest.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.fromAgency.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not your post' });
  }
  await ResourceRequest.findByIdAndDelete(req.params.id);
  // Also delete comments
  const Comment = require('../models/Comment');
  await Comment.deleteMany({ postId: req.params.id, postType: 'exchange' });
  res.json({ message: 'Deleted' });
}));

module.exports = router;

