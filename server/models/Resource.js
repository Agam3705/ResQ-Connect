const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who owns this?
  name: { type: String, required: true }, // e.g. "Water Bottles"
  category: { type: String, enum: ['food', 'medical', 'equipment', 'shelter'], default: 'food' },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'units' }, // e.g. "boxes", "liters"
  
  // LOGISTICS FIELDS
  status: { type: String, enum: ['stored', 'in-transit', 'distributed'], default: 'stored' },
  location: { type: String, default: 'Main Warehouse' }, // Current location
  destination: { type: String, default: '' }, // If moving, where to?
  
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);