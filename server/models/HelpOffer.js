const mongoose = require('mongoose');
const helpOfferSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  contact: String,
  type: { type: String, enum: ['donation', 'volunteer', 'shelter', 'transport'] },
  details: String,
  status: { type: String, default: 'available' }, // available, accepted
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('HelpOffer', helpOfferSchema);