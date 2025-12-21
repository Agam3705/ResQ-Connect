const mongoose = require('mongoose');

const missingPersonSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who reported it
  reporterName: String,
  reporterContact: String,
  
  name: { type: String, required: true },
  age: Number,
  gender: String,
  lastSeenLocation: String,
  lastSeenDate: { type: Date, default: Date.now },
  description: String,
  photoUrl: { type: String, default: '' }, // Optional photo URL
  
  status: { type: String, enum: ['missing', 'found'], default: 'missing' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissingPerson', missingPersonSchema);