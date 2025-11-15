const request = require('supertest');
const app = require('../../src/app.js');

describe('GET /v1/fragments/:id/info Tests', () => {
  test('should return 401 when user is not authenticated', async () => {
    const res = await request(app).get('/v1/fragments/test-id/info');
    expect(res.statusCode).toBe(401);
  });

  test('should return 404 when fragment does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id/info')
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test('should return fragment metadata with metadata properties', async () => {
    // Create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('Test fragment content for info');

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    // Get fragment info
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('ownerId');
    expect(res.body.fragment).toHaveProperty('type');
    expect(res.body.fragment).toHaveProperty('size');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
    expect(res.body.fragment).not.toHaveProperty('data');
    expect(res.body.fragment.id).toBe(fragmentId);
  });
});
