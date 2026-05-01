const mongoose = require('mongoose');

const agencyServiceSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agencyName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['program', 'service', 'alert'], required: true },
  location: String,
  contactDetails: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgencyService', agencyServiceSchema);
