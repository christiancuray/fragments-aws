const request = require('supertest');
const app = require('../../src/app.js');

describe('Test 404 Middleware', () => {
  test('Unknown routes should return a 404 status code and error message "not found"', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
  });
});
