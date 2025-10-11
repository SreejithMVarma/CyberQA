const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
require('./middleware/auth');

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.chmodSync(uploadsDir, '755');
}

// --- CORS Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL,  // "https://cyberqna.onrender.com"
  credentials: true,               // allow cookies across domains
}));

// Compression for static files
app.use(compression());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session setup using MongoDB store ---
//app.set("trust proxy", 1); // important for Render/Heroku behind proxy

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 24 hours
  }),
cookie: {
  httpOnly: true,
  secure: false,        // HTTP
  sameSite: 'lax',      // allow cross-origin cookies in dev
  maxAge: 24 * 60 * 60 * 1000
},
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);

// Base route for API health
app.get('/api', (req, res) => res.send('CyberQA API running...'));

// --- React static hosting ---
// const clientBuildPath = path.join(__dirname, '..', 'frontend', 'build');
// app.use(express.static(clientBuildPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(clientBuildPath, 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;