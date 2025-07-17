const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['numeric', 'ciphertext', 'code', 'formula'], required: true },
  cipherType: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  tags: { type: [String], default: [] },
  expectedAnswer: { type: String, default: '' },
  testCases: { type: [{ input: String, output: String }], default: [] },
  source: { type: String, default: '' }
});

module.exports = mongoose.model('Question', questionSchema);