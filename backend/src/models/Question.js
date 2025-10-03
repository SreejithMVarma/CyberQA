const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['numeric', 'ciphertext', 'code', 'formula', 'subjective'], required: true },
  cipherType: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  tags: [{ type: String }],
  expectedAnswer: { type: String, default: '' },
  testCases: [{ input: String, output: String }],
  source: { type: String, default: '' },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},{ strict: true });

module.exports = mongoose.model('Question', questionSchema);