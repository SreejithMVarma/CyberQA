const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ username, email, password, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  const { id, username, email, role, xp, wallet } = req.user;
  res.json({ user: { id, username, email, role, xp, wallet } });
});


router.get('/logout', (req, res) => {
  req.logout(() => res.json({ message: 'Logged out' }));
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        xp: req.user.xp,
        wallet: req.user.wallet
      }
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});


module.exports = router;