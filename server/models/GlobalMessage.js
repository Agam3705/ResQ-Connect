const mongoose = require('mongoose');
const globalMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('GlobalMessage', globalMessageSchema);