const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['civilian', 'agency', 'admin'], default: 'civilian' },
  
  agencyDetails: {
    agencyName: String,
    type: { type: String, enum: ['police', 'fire', 'medical', 'other'] },
    commanderName: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },

  civilianDetails: {
    // CHANGE: Now an Array of IDs to support multiple groups
    joinedFamilies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Family' }],
    bloodGroup: String,
    emergencyContact: String
  },

  lastLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);