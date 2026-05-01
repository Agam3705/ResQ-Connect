const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const MissingPerson = require('../models/MissingPerson');

// 1. CONFIGURE STORAGE (Same as Documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Save as: missing-timestamp-filename
    cb(null, `missing-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// 2. GET ALL
router.get('/', async (req, res) => {
  try {
    const { all } = req.query; // If all=true, return everything (for admins)
    let query = {};
    
    if (all !== 'true') {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      // Auto-delete records marked found more than 15 days ago
      await MissingPerson.deleteMany({ status: 'found', foundAt: { $lt: fifteenDaysAgo } });
      
      query = { status: { $in: ['missing', 'found'] } };
    }
    
    const people = await MissingPerson.find(query).sort({ status: -1, createdAt: -1 });
    res.json(people);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. REPORT MISSING (Now with Image Upload)
router.post('/report', upload.single('photo'), async (req, res) => {
  try {
    const { reporterId, reporterName, reporterContact, name, age, gender, lastSeenLocation, description } = req.body;

    const newReport = new MissingPerson({
      reporterId,
      reporterName,
      reporterContact,
      name,
      age,
      gender,
      lastSeenLocation,
      description,
      photoUrl: req.file ? req.file.path : '' 
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. MARK AS FOUND
router.put('/found/:id', async (req, res) => {
  try {
    const updated = await MissingPerson.findByIdAndUpdate(
      req.params.id, 
      { status: 'found', foundAt: Date.now() },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;