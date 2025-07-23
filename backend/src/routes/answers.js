const express = require('express');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Submit answer (users)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    const answer = new Answer({
      questionId,
      userId: req.user.id,
      content
    });
    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify answer (admin only)
router.put('/:id/verify', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, xpEarned } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    answer.status = status;
    answer.xpEarned = xpEarned || 0;
    answer.verificationMethod = 'manual';
    await answer.save();

    if (status === 'verified') {
      const user = await User.findById(answer.userId);
      user.xp += xpEarned;
      user.wallet += xpEarned / 10; // 10 XP = 1 INR
      await user.save();
    }
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Suggest changes for answer (admin only)
router.put('/:id/suggest', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { adminComments } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    answer.status = 'rejected';
    answer.adminComments = adminComments || '';
    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user answers
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user.id }).populate('questionId');
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;