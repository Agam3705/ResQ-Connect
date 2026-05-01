const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  location: { lat: Number, lng: Number },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Agency managing this
  wards: {
    icu: { total: { type: Number, default: 0 }, occupied: { type: Number, default: 0 } },
    general: { total: { type: Number, default: 0 }, occupied: { type: Number, default: 0 } },
    pediatric: { total: { type: Number, default: 0 }, occupied: { type: Number, default: 0 } },
    maternity: { total: { type: Number, default: 0 }, occupied: { type: Number, default: 0 } },
    emergency: { total: { type: Number, default: 0 }, occupied: { type: Number, default: 0 } }
  },
  status: { type: String, enum: ['operational', 'limited', 'closed'], default: 'operational' },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
