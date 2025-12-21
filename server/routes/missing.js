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
    const people = await MissingPerson.find().sort({ status: -1, createdAt: -1 });
    res.json(people);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. REPORT MISSING (Now with Image Upload)
router.post('/report', upload.single('photo'), async (req, res) => {
  try {
    // req.body contains text fields, req.file contains the image
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
      // Save file path if an image was uploaded
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
      { status: 'found' },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;