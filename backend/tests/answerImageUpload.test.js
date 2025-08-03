const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');

describe('Answer Image Upload', () => {
  let token;
  let questionId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword', // Note: Use bcrypt in actual setup
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = loginRes.body.token;

    // Create a test question
    const question = await Question.create({
      title: 'Test Question',
      content: 'Test Content',
      userId: user._id,
    });
    questionId = question._id;
  });

  it('should upload an answer with an image', async () => {
    const res = await request(app)
      .post('/api/answers')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', 'tests/fixtures/test-image.jpg')
      .field('content', 'Test answer')
      .field('questionId', questionId);
    expect(res.statusCode).toBe(201);
    expect(res.body.image).toContain('/uploads/');
    expect(res.body.content).toBe('Test answer');
    expect(res.body.questionId).toEqual(questionId.toString());
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});