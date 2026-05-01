const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  fromAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromAgencyName: String,
  toAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = open request visible to all
  toAgencyName: String,
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, enum: ['food', 'medical', 'equipment', 'shelter', 'fuel', 'water', 'clothing', 'other'] },
    unit: { type: String, default: 'units' }
  }],
  type: { type: String, enum: ['request', 'surplus'], default: 'request' }, // request = need, surplus = have extra
  status: { type: String, enum: ['open', 'pending', 'approved', 'rejected', 'fulfilled'], default: 'open' },
  urgency: { type: String, enum: ['critical', 'high', 'normal', 'low'], default: 'normal' },
  message: String,
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  respondedAt: Date,
  fulfilledAt: Date
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
