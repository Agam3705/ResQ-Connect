const mongoose = require('mongoose');
const rumorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  votesTrue: { type: Number, default: 0 },
  votesFalse: { type: Number, default: 0 },
  adminStatus: { type: String, enum: ['unverified', 'verified', 'debunked'], default: 'unverified' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Rumor', rumorSchema);