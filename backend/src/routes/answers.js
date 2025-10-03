const express = require('express');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'answers', req.params.questionId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
   // console.log('Generated filename:', filename); // Debug
    cb(null, filename);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
});

// Submit answer (users)
router.post('/:questionId', isAuthenticated, upload.array('images', 10), async (req, res) => {
  try {
    const { questionId, content } = req.body;
    if (!questionId || !content) {
      return res.status(400).json({ message: 'questionId and content are required' });
    }
    const images = req.files ? req.files.map(file => `/uploads/answers/${questionId}/${file.filename}`) : [];

    const answer = new Answer({
      questionId,
      userId: req.user.id,
      content,
      images,
    });
    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ message: err.message });
  }
});

// Verify answer (admin only)
router.post('/:id/verify', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, comments, xpEarned } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    answer.status = status;
    answer.xpEarned = xpEarned || 0;
    answer.verificationMethod = 'manual';
    answer.adminComments = comments || '';
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
router.post('/:id/suggest', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { comments } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    answer.status = 'rejected';
    answer.adminComments = comments || '';
    await answer.save();
    res.json(answer);
  } catch (err) {
    console.error('Error suggesting changes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Resubmit answer (users, only for their own answers)
router.put('/:id/resubmit', isAuthenticated, upload.array('images', 10), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to resubmit this answer' });
    }

    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => `/uploads/answers/${answer.questionId}/${file.filename}`);
      answer.images = images;
    }

    answer.content = content;
    answer.status = 'pending';
    answer.adminComments = '';
    await answer.save();
    res.json(answer);
  } catch (err) {
    console.error('Error resubmitting answer:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all pending answers (admin only) with pagination
router.get('/pending', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const answers = await Answer.find({ status: 'pending' })
      .populate('questionId', 'questionText')
      .populate('userId', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Answer.countDocuments({ status: 'pending' });
    res.json({
      answers,
      totalPages: Math.ceil(total / limit),
    });
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

// Get all answers for a question (for question detail page)
router.get('/question/:questionId', isAuthenticated, async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('userId', 'username')
      .populate('questionId', 'questionText');
    res.json(answers);
  } catch (err) {
    console.error('Error fetching answers for question:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;