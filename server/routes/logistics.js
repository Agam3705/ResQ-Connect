const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

// 1. GET ALL RESOURCES
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  // If agency, return only theirs. If admin, could return all (assuming agencyId is set on creation).
  // For now, return all or filter by agency if agency logs in.
  const query = req.user.role === 'admin' ? {} : { agencyId: req.user.id };
  const resources = await Resource.find(query).sort({ lastUpdated: -1 });
  res.json(resources);
}));

// 2. ADD NEW RESOURCE
router.post('/add', verifyToken, asyncHandler(async (req, res) => {
  const newItem = new Resource({
    ...req.body,
    agencyId: req.user.id
  });
  await newItem.save();
  res.status(201).json(newItem);
}));

// 3. EDIT STORED RESOURCE
router.put('/edit/:id', verifyToken, asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  if (resource.agencyId?.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updatedItem = await Resource.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdated: new Date() },
    { new: true }
  );
  res.json(updatedItem);
}));

// 4. DISPATCH RESOURCE (Partial or Full)
router.put('/dispatch/:id', verifyToken, asyncHandler(async (req, res) => {
  const { destination, quantity } = req.body;
  const dispatchQty = parseInt(quantity);
  const resource = await Resource.findById(req.params.id);
  
  if (!resource) return res.status(404).json({ message: 'Not found' });
  if (resource.agencyId?.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (dispatchQty <= 0 || dispatchQty > resource.quantity) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  if (dispatchQty < resource.quantity) {
    // Partial dispatch: split the resource
    resource.quantity -= dispatchQty;
    resource.lastUpdated = new Date();
    await resource.save();

    // Create transit clone
    const transitItem = new Resource({
      agencyId: resource.agencyId,
      name: resource.name,
      category: resource.category,
      quantity: dispatchQty,
      unit: resource.unit,
      status: 'in-transit',
      location: resource.location,
      destination: destination
    });
    await transitItem.save();
    return res.json({ message: 'Partial dispatch successful' });
  } else {
    // Full dispatch
    resource.status = 'in-transit';
    resource.destination = destination;
    resource.lastUpdated = new Date();
    await resource.save();
    return res.json(resource);
  }
}));

// 5. MARK AS DELIVERED
router.put('/deliver/:id', verifyToken, asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  if (resource.agencyId?.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  resource.status = 'distributed';
  resource.location = resource.destination;
  resource.destination = '';
  resource.lastUpdated = new Date();
  await resource.save();
  res.json(resource);
}));

// 6. MARK AS FAILED (Return to stored)
router.put('/failed/:id', verifyToken, asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  if (resource.agencyId?.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  resource.status = 'stored';
  resource.destination = '';
  resource.lastUpdated = new Date();
  await resource.save();
  res.json(resource);
}));

// 7. DELETE
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  if (resource.agencyId?.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}));

module.exports = router;