const express = require('express');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', process.env.STORAGE_PATH));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Submit answer (users)
router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { questionId, content } = req.body;
    if (!questionId || !content) {
      return res.status(400).json({ message: 'questionId and content are required' });
    }
    const image = req.file ? `${process.env.STORAGE_PATH}/${req.file.filename}` : null;

    const answer = new Answer({
      questionId,
      userId: req.user.id,
      content,
      image,
    });
    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    console.error('Error saving answer:', err);
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
    console.error('Error verifying answer:', err);
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
    console.error('Error suggesting changes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Resubmit answer (users, only for their own answers)
router.put('/:id/resubmit', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }
    const image = req.file ? `${process.env.STORAGE_PATH}/${req.file.filename}` : null;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to resubmit this answer' });
    }
    answer.content = content;
    answer.image = image || answer.image; // Keep existing image if no new one uploaded
    answer.status = 'pending';
    answer.adminComments = '';
    await answer.save();
    res.json(answer);
  } catch (err) {
    console.error('Error resubmitting answer:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all pending answers (admin only)
router.get('/pending', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const answers = await Answer.find({ status: 'pending' })
      .populate('questionId', 'questionText')
      .populate('userId', 'username');
    res.json(answers);
  } catch (err) {
    console.error('Error fetching pending answers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user answers (for user profile)
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const answers = await Answer.find({ userId: req.user.id }).populate('questionId', 'questionText');
    res.json(answers);
  } catch (err) {
    console.error('Error fetching user answers:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;