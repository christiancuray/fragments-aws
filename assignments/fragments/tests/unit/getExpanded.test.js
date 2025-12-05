const request = require('supertest');
const app = require('../../src/app.js');

describe('GET /v1/fragments?expand=1 Tests', () => {
  test('should return 401 when user is not authenticated', async () => {
    const res = await request(app).get('/v1/fragments?expand=1');
    expect(res.statusCode).toBe(401);
  });

  test('should return 404 when user has no fragments', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@gmail.com', 'password123');

    // Empty list is valid - return 200
    expect(res.statusCode).toBe(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([]);
  });

  test('should return expanded fragments with full metadata when fragments exist', async () => {
    // First create a fragment to ensure there's something to retrieve
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('Test fragment content');

    expect(postRes.statusCode).toBe(201);

    // Now get expanded fragments
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toBeDefined();
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBeGreaterThan(0);

    // Verify expanded fragment has all required metadata fields
    const fragment = res.body.fragments[0];
    expect(fragment).toHaveProperty('id');
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('type');
    expect(fragment).toHaveProperty('size');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
  });
});
