const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['flood', 'earthquake', 'cyclone', 'fire', 'pandemic', 'landslide', 'tsunami', 'drought', 'other'], required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'high' },
  location: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radius: { type: Number, default: 10 } // km
  },
  status: { type: String, enum: ['active', 'contained', 'resolved'], default: 'active' },
  assignedAgencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stats: {
    affectedPeople: { type: Number, default: 0 },
    rescued: { type: Number, default: 0 },
    missing: { type: Number, default: 0 },
    sheltered: { type: Number, default: 0 }
  },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

module.exports = mongoose.model('Disaster', disasterSchema);
