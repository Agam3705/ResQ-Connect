const mongoose = require('mongoose');

const firstAidNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  iconName: { type: String, default: 'Heart' }, // To be mapped on frontend
  color: { type: String, default: 'bg-blue-500/10 border-blue-500' },
  tags: [String],
  steps: [String],
  warning: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FirstAidNote', firstAidNoteSchema);
