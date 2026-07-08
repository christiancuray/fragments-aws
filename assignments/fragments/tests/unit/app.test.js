const request = require('supertest');
const app = require('../../src/app.js');

// Test 404 Middleware

describe('Test 404 Middleware', () => {
  test('Unknown routes should return a 404 status code and error message "not found"', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
  });
});

// Test Error Handling Middleware
describe('Test Error Handling Middleware', () => {
  test('should return 500 status code for server errors', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('ERROR');

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Internal server error');
    expect(res.body.error.code).toBe(500);
  });
});
