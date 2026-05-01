const mongoose = require('mongoose');
const hazardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true }, // Fire, Flood, Debris
  description: String,
  location: { lat: Number, lng: Number },
  timestamp: { type: Date, default: Date.now },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});
module.exports = mongoose.model('Hazard', hazardSchema);