const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Question = require('../src/models/Question');
const Answer = require('../src/models/Answer');

let userCookie, adminCookie, question, userId, adminId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Answer.deleteMany({});
  await Question.deleteMany({});

  const timestamp = Date.now();
  const userUsername = `testuser_${timestamp}`;
  const adminUsername = `adminuser_${timestamp}`;
  const userEmail = `user_${timestamp}@test.com`;
  const adminEmail = `admin_${timestamp}@test.com`;

  global.userInfo = {
    username: userUsername,
    email: userEmail,
    password: 'password',
  };

  global.adminInfo = {
    username: adminUsername,
    email: adminEmail,
    password: 'password',
  };

  await request(app).post('/api/auth/register').send(global.userInfo);
  await request(app).post('/api/auth/register').send(global.adminInfo);

  const admin = await User.findOne({ email: global.adminInfo.email });
  admin.role = 'admin';
  await admin.save();

  const user = await User.findOne({ email: global.userInfo.email });
  userId = user._id;
  adminId = admin._id;

  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: global.userInfo.email, password: global.userInfo.password })
    .expect(200);

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: global.adminInfo.email, password: global.adminInfo.password })
    .expect(200);

  userCookie = userRes.headers['set-cookie'];
  adminCookie = adminRes.headers['set-cookie'];

  if (!userCookie || !adminCookie) {
    console.error('Login cookie missing:', {
      userCookie,
      adminCookie,
    });
    throw new Error('Login failed — cookies not set');
  }

  question = await Question.create({
    questionText: 'Test question',
    type: 'numeric',
    tags: ['test'],
    difficulty: 'easy',
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Answer.deleteMany({});
  await Question.deleteMany({});
  await mongoose.connection.close();
});

describe('Answers API', () => {
  test('should allow admin to suggest changes to an answer', async () => {
    const answer = await Answer.create({
      questionId: question._id,
      userId: userId,
      content: 'Test answer',
      status: 'pending',
    });

    const res = await request(app)
      .put(`/api/answers/${answer._id}/suggest`)
      .set('Cookie', adminCookie)
      .send({ adminComments: 'Looks better' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.adminComments).toBe('Looks better');
  });

  test('should allow admin to fetch all pending answers with username', async () => {
    const answer = await Answer.create({
      questionId: question._id,
      userId: userId,
      content: 'Test answer',
      status: 'pending',
    });

    const res = await request(app)
      .get('/api/answers/pending')
      .set('Cookie', adminCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);

    const found = res.body.find((a) => a._id === answer._id.toString());
    expect(found).toBeTruthy();
    expect(found.questionId?.questionText).toBe('Test question');
    expect(found.userId?.username).toBe(global.userInfo.username);
  });

  test('should allow user to resubmit an answer and reflect in user answers', async () => {
    const answer = await Answer.create({
      questionId: question._id,
      userId: userId,
      content: '40',
      status: 'rejected',
      adminComments: 'answer is wrong',
    });

    const res = await request(app)
      .put(`/api/answers/${answer._id}/resubmit`)
      .set('Cookie', userCookie)
      .send({ content: '42' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.content).toBe('42');

    const userAnswers = await request(app)
      .get('/api/answers/user')
      .set('Cookie', userCookie);

    expect(userAnswers.statusCode).toBe(200);
    expect(userAnswers.body).toBeInstanceOf(Array);
    expect(userAnswers.body.some((a) => a.content === '42')).toBe(true);
  });
});
