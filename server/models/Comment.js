const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  postType: { type: String, required: true, enum: ['exchange', 'medicine', 'transport', 'service'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, default: 'civilian' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ postId: 1, postType: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
