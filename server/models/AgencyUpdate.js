const mongoose = require('mongoose');
const agencyUpdateSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agencyName: String,
  title: String,
  content: String,
  type: { type: String, enum: ['program', 'alert', 'news'], default: 'news' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AgencyUpdate', agencyUpdateSchema);