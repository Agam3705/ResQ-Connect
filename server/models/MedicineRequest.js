const mongoose = require('mongoose');

const medicineRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  type: { type: String, enum: ['request', 'offer'], required: true },
  medicineName: { type: String, required: true },
  category: { type: String, enum: ['insulin', 'epipen', 'inhaler', 'blood-pressure', 'antibiotics', 'painkillers', 'other'], default: 'other' },
  quantity: { type: String, default: '1' },
  urgency: { type: String, enum: ['critical', 'high', 'normal'], default: 'normal' },
  description: String,
  location: { lat: Number, lng: Number, area: String },
  contact: String,
  status: { type: String, enum: ['active', 'fulfilled', 'expired'], default: 'active' },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) } // 48 hours
});

module.exports = mongoose.model('MedicineRequest', medicineRequestSchema);
