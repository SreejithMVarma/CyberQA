const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.db.collection('sessions').deleteMany({});
    await mongoose.connection.close();
  });

  it('should register a new user with username and authenticate', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user.username).toBe('testuser1');
    expect(res.body.user.email).toBe('test1@example.com');

    const user = await User.findOne({ email: 'test1@example.com' });
    expect(user.username).toBe('testuser1');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', res.headers['set-cookie']);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.username).toBe('testuser1');
  });

  it('should prevent registration with duplicate username', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test2@example.com',
      password: 'password',
    });

    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test3@example.com',
      password: 'password',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Username already exists');
  });

  it('should prevent registration with missing username', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test4@example.com',
      password: 'password',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Username, email, and password are required');
  });

  it('should allow login for existing user and authenticate', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'olduser',
      email: 'olduser@example.com',
      password: 'password',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'olduser@example.com',
      password: 'password',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user.email).toBe('olduser@example.com');
    expect(res.body.user.username).toBe('olduser');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', res.headers['set-cookie']);
    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.username).toBe('olduser');
  });
});
