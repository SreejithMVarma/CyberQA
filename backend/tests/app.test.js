const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

describe('GET /', () => {
  it('should return CyberQA API', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('CyberQA API');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
