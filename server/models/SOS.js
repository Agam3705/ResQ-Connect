const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  locationName: String, // reverse geocoded
  type: { 
    type: String, 
    enum: ['general', 'medical', 'fire', 'police', 'accident', 'violence', 'flood', 'earthquake', 'rescue'], 
    default: 'general' 
  },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
  details: { type: String, default: '' },
  peopleCount: {
    infants: { type: Boolean, default: false },
    elderly: { type: Boolean, default: false },
    count: { type: Number, default: 1 }
  },
  // Case management
  assignedAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAgencyName: String,
  responderNotes: String,
  disasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
  
  status: { type: String, enum: ['active', 'assigned', 'in-progress', 'resolved'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  assignedAt: Date,
  resolvedAt: Date
});

sosSchema.index({ status: 1, createdAt: -1 });
sosSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('SOS', sosSchema);