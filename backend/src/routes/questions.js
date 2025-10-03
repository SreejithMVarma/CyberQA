const express = require("express");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.uploadPath) {
      req.uploadPath = path.join(__dirname, '..', '..', 'uploads', 'questions', `${Date.now()}`);
      fs.mkdirSync(req.uploadPath, { recursive: true });
    }
    cb(null, req.uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG and PNG images are allowed"));
  },
});

// Get all questions with filters and pagination
router.get("/", async (req, res) => {
  try {
    const { type, difficulty, tags, solved, page = 1, limit = 10 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $all: tags.split(",") };
    if (solved === "unsolved") {
      const answeredQuestions = await Answer.find({
        status: "verified",
      }).distinct("questionId");
      query._id = { $nin: answeredQuestions };
    } else if (solved === "solved") {
      const answeredQuestions = await Answer.find({
        status: "verified",
      }).distinct("questionId");
      query._id = { $in: answeredQuestions };
    }

    const questions = await Question.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Question.countDocuments(query);
    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single question
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({ message: err.message });
  }
});

// Upload images for question
router.post(
  "/upload-images",
  isAuthenticated,
  isAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });
      const imageUrls = req.files.map(file => `/uploads/questions/${path.basename(path.dirname(file.path))}/${file.filename}`);
      res.json({ imageUrls });
    } catch (err) {
      console.error("Error uploading images:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Create a new question
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      questionText,
      type,
      cipherType,
      difficulty,
      tags,
      expectedAnswer,
      testCases,
      source,
      images,
    } = req.body;
    if (!questionText || !type || !difficulty) {
      return res
        .status(400)
        .json({ message: "Question text, type, and difficulty are required" });
    }
    const question = new Question({
      questionText,
      type,
      cipherType: cipherType || "",
      difficulty,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      expectedAnswer: expectedAnswer || "",
      testCases: testCases || [],
      source: source || "",
      images: images || [],
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error("Error creating question:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update a question
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      questionText,
      type,
      cipherType,
      difficulty,
      tags,
      expectedAnswer,
      testCases,
      source,
      images,
    } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    question.questionText = questionText;
    question.type = type;
    question.cipherType = cipherType || "";
    question.difficulty = difficulty;
    question.tags = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    question.expectedAnswer = expectedAnswer || "";
    question.testCases = testCases || [];
    question.source = source || "";
    question.images = images || [];
    await question.save();
    res.json(question);
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a question
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
