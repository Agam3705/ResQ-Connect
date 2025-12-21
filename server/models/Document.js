const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['identity', 'medical', 'insurance', 'other'], default: 'other' },
  
  // Distinguish between File and Note
  type: { type: String, enum: ['file', 'note'], required: true },

  // For Files
  filePath: { type: String }, 
  fileType: { type: String },

  // For Notes
  textContent: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);