const mongoose = require('mongoose');

const agencyChatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  agencyName: String,
  text: { type: String, required: true },
  type: { type: String, enum: ['message', 'alert', 'request'], default: 'message' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgencyChat', agencyChatSchema);
