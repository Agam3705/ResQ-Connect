const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage: storage });

// 2. UPLOAD FILE
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, title, category } = req.body;
    const newDoc = new Document({
      userId, title, category,
      type: 'file',
      filePath: req.file.path,
      fileType: req.file.mimetype
    });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE TEXT NOTE (NEW ROUTE)
router.post('/note', async (req, res) => {
  try {
    const { userId, title, category, textContent } = req.body;
    const newNote = new Document({
      userId, title, category,
      type: 'note',
      textContent
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET ALL
router.get('/:userId', async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. DELETE
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // Only try to delete file if it exists and is a file type
    if (doc.type === 'file' && doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;