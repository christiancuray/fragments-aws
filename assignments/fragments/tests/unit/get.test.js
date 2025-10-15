const request = require('supertest');
const app = require('../../src/app.js');

describe('Test GET /v1/fragments', () => {
  // if the request is missing the Authorizationn header, it should be forbidden and return a 401 status code
  test('Unauthorized request should be denied and return a 401 status code', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  // if the wrong credentials are provided, it should be forbidden and return a 401 status code
  test('Wrong credentials should be denied and return a 401 status code', async () => {
    const res = await request(app).get('/v1/fragments').auth('invalidUser', 'invalidPass123!');
    expect(res.statusCode).toBe(401);
  });

  // if the correct credentials are provided, it should return a 200 status code
  test('Authenticated users get access and return a 200 status code', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@gmail.com', 'password123');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.message).toBe('fragments retrieved successfully');
  });
});
