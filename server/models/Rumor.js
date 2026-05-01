const mongoose = require('mongoose');
const rumorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  voters: [{ userId: String, vote: { type: String, enum: ['true', 'false'] } }],
  adminStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'debunked'], default: 'unverified' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Rumor', rumorSchema);