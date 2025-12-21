const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // EXPANDED ENUM to fix the "Failed" errors
  type: { 
    type: String, 
    enum: ['general', 'medical', 'fire', 'police', 'accident', 'violence'], 
    default: 'general' 
  },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
  
  // NEW FIELDS FOR DETAILS
  details: { type: String, default: '' },
  peopleCount: {
    infants: { type: Boolean, default: false },
    elderly: { type: Boolean, default: false },
  },

  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('SOS', sosSchema);