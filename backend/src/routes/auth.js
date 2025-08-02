const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log('Registration request:', { username, email }); // Debug log
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Add regex validation for username
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ message: 'Username can only contain alphanumeric characters, underscores, or hyphens' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists',
      });
    }

    const user = new User({ username, email, password });
    await user.save();
    
    // Initialize Passport session
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in user after registration:', err);
        return next(err);
      }
      req.session.user = { id: user._id, email: user.email, role: user.role, username: user.username };
      console.log('User registered:', req.session.user); // Debug log
      return res.status(201).json({ message: 'User registered successfully', user: req.session.user });
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Initialize Passport session
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return next(err);
      }
      req.session.user = { id: user._id, email: user.email, role: user.role, username: user.username || '' };
      res.json({ message: 'Login successful', user: req.session.user });
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
});

module.exports = router;