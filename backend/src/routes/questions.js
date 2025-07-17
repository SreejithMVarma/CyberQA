const express = require('express');
const Question = require('../models/Question');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all questions (public for users)
router.get('/', isAuthenticated, async (req, res) => {
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

// Create question (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update question (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    Object.assign(question, req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete question (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
