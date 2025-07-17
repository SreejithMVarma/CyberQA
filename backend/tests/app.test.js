const request = require('supertest');
const app = require('../src/app');

describe('API', () => {
  it('should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('CyberQA API');
  });
});