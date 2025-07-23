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

    const res = await request(app)
      .put(`/api/answers/${answer._id}/suggest`)
      .set('Cookie', ['connect.sid=admin-session']) // Mocked admin session
      .send({ adminComments: 'Please clarify your explanation' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.adminComments).toBe('Please clarify your explanation');

    const updatedAnswer = await Answer.findById(answer._id);
    expect(updatedAnswer.status).toBe('rejected');
    expect(updatedAnswer.adminComments).toBe('Please clarify your explanation');
  });

  it('should allow admin to fetch all pending answers', async () => {
    const answer = await Answer.create({
      questionId: question._id,
      userId: user._id,
      content: 'Test answer',
      status: 'pending',
    });

    const res = await request(app)
      .get('/api/answers/pending')
      .set('Cookie', ['connect.sid=admin-session']); // Mocked admin session

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.some((a) => a._id === answer._id.toString())).toBe(true);
    expect(res.body[0].questionId.questionText).toBe('Test question');
    expect(res.body[0].userId.username).toBe('testuser');
  });
});