const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Question = require('../src/models/Question');
const Answer = require('../src/models/Answer');

let userCookie, adminCookie, question, userId, adminId;

beforeAll(async () => {
  await User.deleteMany({});
  await Answer.deleteMany({});
  await Question.deleteMany({});

  // Generate unique data
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

  // Register users
  await request(app).post('/api/auth/register').send(global.userInfo);
  await request(app).post('/api/auth/register').send(global.adminInfo);

  // Update admin role
  const admin = await User.findOne({ email: global.adminInfo.email });
  if (!admin) throw new Error('Admin not created');
  admin.role = 'admin';
  await admin.save();

  const user = await User.findOne({ email: global.userInfo.email });
  if (!user) throw new Error('User not created');

  userId = user._id;
  adminId = admin._id;

  // Login users
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: global.userInfo.email, password: global.userInfo.password });

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: global.adminInfo.email, password: global.adminInfo.password });

  userCookie = userRes.headers['set-cookie'];
  adminCookie = adminRes.headers['set-cookie'];

  // Create a test question
  question = await Question.create({
    questionText: 'Test question',
    tags: ['test'],
    difficulty: 'easy',
    createdBy: adminId,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Answer.deleteMany({});
  await Question.deleteMany({});
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
      .send({ suggestedAnswer: 'Updated suggestion', adminComments: 'Looks better' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Suggested answer updated');
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
    expect(res.body.some((a) => a._id === answer._id.toString())).toBe(true);
    expect(res.body[0].questionId.questionText).toBe('Test question');
    expect(res.body[0].user.username).toBe(global.userInfo.username);
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
    expect(res.body.message).toBe('Answer resubmitted');

    const userAnswers = await request(app)
      .get('/api/answers/my')
      .set('Cookie', userCookie);

    expect(userAnswers.statusCode).toBe(200);
    expect(userAnswers.body).toBeInstanceOf(Array);
    expect(userAnswers.body.some((a) => a.content === '42')).toBe(true);
  });
});
