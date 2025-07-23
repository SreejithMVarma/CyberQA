require('dotenv').config({ path: '.env.test' }); // Load test-specific env
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Answer = require('../src/models/Answer');
const User = require('../src/models/User');
const Question = require('../src/models/Question');

describe('Answers API', () => {
  let user, admin, question;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    user = await User.create({
      username: 'testuser',
      email: 'user@test.com',
      password: 'password',
      role: 'user',
    });

    admin = await User.create({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'password',
      role: 'admin',
    });

    question = await Question.create({
      questionText: 'Test question',
      type: 'numeric',
      difficulty: 'easy',
    });
  });

  afterAll(async () => {
    await Answer.deleteMany({});
    await User.deleteMany({});
    await Question.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow admin to suggest changes to an answer', async () => {
    const answer = await Answer.create({
      questionId: question._id,
      userId: user._id,
      content: 'Test answer',
      status: 'pending',
    });

    // Step: Login as admin and get session cookie
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password',
    });

    expect(loginRes.statusCode).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    // Step: Send suggestion with cookie
    const res = await request(app)
      .put(`/api/answers/${answer._id}/suggest`)
      .set('Cookie', cookies)
      .send({ adminComments: 'Please clarify your explanation' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.adminComments).toBe('Please clarify your explanation');

    const updatedAnswer = await Answer.findById(answer._id);
    expect(updatedAnswer.status).toBe('rejected');
    expect(updatedAnswer.adminComments).toBe('Please clarify your explanation');
  });
});
