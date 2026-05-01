const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: String,
  donorContact: String,
  items: [{
    name: { type: String, required: true },
    category: { type: String, enum: ['blankets', 'water', 'food', 'clothes', 'medicine', 'hygiene', 'other'] },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'units' }
  }],
  location: { lat: Number, lng: Number, address: String },
  matchedCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
  status: { type: String, enum: ['pledged', 'matched', 'in-transit', 'delivered'], default: 'pledged' },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date
});

const campSchema = new mongoose.Schema({
  name: { type: String, required: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { lat: Number, lng: Number, address: String },
  capacity: { type: Number, default: 0 },
  currentOccupancy: { type: Number, default: 0 },
  needsItems: [{
    name: String,
    category: String,
    urgency: { type: String, enum: ['critical', 'high', 'normal'], default: 'normal' },
    quantityNeeded: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['active', 'full', 'closed'], default: 'active' },
  disasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
  createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);
const Camp = mongoose.model('Camp', campSchema);
module.exports = { Donation, Camp };
