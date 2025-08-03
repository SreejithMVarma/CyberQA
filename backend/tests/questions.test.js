const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Question = require('../src/models/Question');
const fs = require('fs');
const path = require('path');

describe('Questions API', () => {
  let adminCookie;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
    });
    await admin.save();

    // Login as admin to get cookie
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });
    adminCookie = res.headers['set-cookie'];
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Question.deleteMany({});
    await mongoose.connection.db.collection('sessions').deleteMany({});
    await mongoose.connection.close();
  });

  it('should upload a valid image', async () => {
    const imagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(imagePath, 'fake image content');

    const res = await request(app)
      .post('/api/questions/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', imagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.imageUrl).toMatch(/\/uploads\/\d+-[a-z0-9]+-test-image\.jpg/);

    // Verify image is accessible
    const imageRes = await request(app).get(res.body.imageUrl);
    expect(imageRes.statusCode).toBe(200);

    fs.unlinkSync(imagePath);
  });

  it('should reject invalid file types', async () => {
    const filePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(filePath, 'text content');

    const res = await request(app)
      .post('/api/questions/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', filePath);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Only JPEG and PNG images are allowed');

    fs.unlinkSync(filePath);
  });

  it('should create a question with image', async () => {
    const imagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(imagePath, 'fake image content');

    const uploadRes = await request(app)
      .post('/api/questions/upload-image')
      .set('Cookie', adminCookie)
      .attach('image', imagePath);

    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question',
        type: 'numeric',
        difficulty: 'easy',
        image: uploadRes.body.imageUrl,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question');
    expect(res.body.image).toMatch(/\/uploads\/\d+-[a-z0-9]+-test-image\.jpg/);

    fs.unlinkSync(imagePath);
  });

  it('should create a question with valid tags', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question with tags',
        type: 'numeric',
        difficulty: 'easy',
        tags: 'crypto,network,security',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question with tags');
    expect(res.body.tags).toEqual(['crypto', 'network', 'security']);
  });

  it('should handle empty tags', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question no tags',
        type: 'numeric',
        difficulty: 'easy',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question no tags');
    expect(res.body.tags).toEqual([]);
  });

  it('should handle undefined tags', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question undefined tags',
        type: 'numeric',
        difficulty: 'easy',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question undefined tags');
    expect(res.body.tags).toEqual([]);
  });

  it('should handle array tags', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question array tags',
        type: 'numeric',
        difficulty: 'easy',
        tags: ['crypto', 'network'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question array tags');
    expect(res.body.tags).toEqual(['crypto', 'network']);
  });

  it('should create a question without expectedAnswer', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', adminCookie)
      .send({
        questionText: 'Test question no answer',
        type: 'numeric',
        difficulty: 'easy',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.questionText).toBe('Test question no answer');
    expect(res.body.expectedAnswer).toBe('');
  });
});