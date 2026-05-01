const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['civilian', 'agency', 'admin'], default: 'civilian' },

  // OAuth
  googleId: { type: String, sparse: true },
  avatar: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // Account Status
  isActive: { type: Boolean, default: true },

  agencyDetails: {
    agencyName: String,
    type: { type: String, enum: ['police', 'fire', 'medical', 'ngo', 'other'] },
    commanderName: String,
    licenseNumber: String,
    address: String,
    phone: String,
    services: [String], // ['rescue', 'medical-aid', 'food-supply', 'shelter']
    operatingHours: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },

  civilianDetails: {
    joinedFamilies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Family' }],
    bloodGroup: String,
    emergencyContact: String
  },

  // Profile
  phone: String,
  address: String,

  lastLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },

  createdAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
userSchema.index({ 'lastLocation.lat': 1, 'lastLocation.lng': 1 });
userSchema.index({ role: 1, 'agencyDetails.status': 1 });

module.exports = mongoose.model('User', userSchema);