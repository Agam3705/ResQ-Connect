const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// 1. GET ALL RESOURCES (For a specific agency or all)
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ lastUpdated: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. ADD NEW RESOURCE
router.post('/add', async (req, res) => {
  try {
    const newItem = new Resource(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. DISPATCH RESOURCE (Update status & move it)
router.put('/dispatch/:id', async (req, res) => {
  try {
    const { destination } = req.body;
    const updatedItem = await Resource.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'in-transit', 
        destination: destination,
        lastUpdated: new Date()
      },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. MARK AS DELIVERED/DISTRIBUTED
router.put('/deliver/:id', async (req, res) => {
  try {
    const item = await Resource.findById(req.params.id);
    const updatedItem = await Resource.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'distributed', 
        location: item.destination, // Current location becomes the destination
        destination: '',
        lastUpdated: new Date()
      },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;