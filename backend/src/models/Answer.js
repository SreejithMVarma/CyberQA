const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  xpEarned: { type: Number, default: 0 },
  verificationMethod: { type: String, enum: ['manual', 'auto'], default: 'manual' },
  adminComments: { type: String, default: '' }
});

module.exports = mongoose.model('Answer', answerSchema);