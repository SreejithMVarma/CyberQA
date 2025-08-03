const express = require('express');
const mongoose = require('mongoose');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Question = require('../models/Question');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
});

// Image upload endpoint
router.post('/upload-image', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all questions with filters
router.get('/', async (req, res) => {
  try {
    const { type, difficulty, tags } = req.query;
    const query = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };
    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create question
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { questionText, type, cipherType, difficulty, tags, expectedAnswer, testCases, source, image } = req.body;
    if (!questionText || !type || !difficulty) {
      return res.status(400).json({ message: 'Required fields: questionText, type, difficulty' });
    }
    const question = new Question({
      questionText,
      type,
      cipherType: cipherType || '',
      difficulty,
      tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : (Array.isArray(tags) ? tags : []),
      expectedAnswer: expectedAnswer || '',
      testCases: testCases || [],
      source: source || '',
      image: image || '',
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update question
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    const { questionText, type, cipherType, difficulty, tags, expectedAnswer, testCases, source, image } = req.body;
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.questionText = questionText || question.questionText;
    question.type = type || question.type;
    question.cipherType = cipherType !== undefined ? cipherType : question.cipherType;
    question.difficulty = difficulty || question.difficulty;
    question.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : (Array.isArray(tags) ? tags : question.tags);
    question.expectedAnswer = expectedAnswer !== undefined ? expectedAnswer : question.expectedAnswer;
    question.testCases = testCases || question.testCases;
    question.source = source !== undefined ? source : question.source;
    question.image = image !== undefined ? image : question.image;
    question.updatedAt = Date.now();
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete question
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;