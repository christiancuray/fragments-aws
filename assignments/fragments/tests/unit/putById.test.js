const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  // test auth
  const user = 'user1@gmail.com';
  const pass = 'password123';

  test('Unauthenticated requests should be denied', async () => {
    const res = await request(app).put('/v1/fragments/1234');
    expect(res.statusCode).toBe(401);
  });

  test('Authenticated user can update their own fragment', async () => {
    // First, create a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Original content');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // Now update it with the same content type
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Updated content');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('ok');
    expect(updateRes.body.fragment.id).toBe(fragmentId);
    expect(updateRes.body.fragment.type).toBe('text/plain');
    expect(updateRes.headers.location).toContain(fragmentId);
  });

  test('Cannot update fragment with different content type', async () => {
    // Create a text/plain fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Original content');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // Try to update with application/json
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send('{"key": "value"}');

    expect(updateRes.statusCode).toBe(400);
    expect(updateRes.body.status).toBe('error');
    expect(updateRes.body.error.message).toContain('Cannot change fragment type');
  });

  test('Cannot update non-existent fragment', async () => {
    const updateRes = await request(app)
      .put('/v1/fragments/nonexistent')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Updated content');

    expect(updateRes.statusCode).toBe(404);
    expect(updateRes.body.status).toBe('error');
    expect(updateRes.body.error.message).toContain('Fragment not found');
  });

  test("Cannot update another user's fragment", async () => {
    const user2 = 'user2@gmail.com';
    const pass2 = 'password123';

    // User 1 creates a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Original content');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // User 2 tries to update it
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user2, pass2)
      .set('Content-Type', 'text/plain')
      .send('Hacked content');

    expect(updateRes.statusCode).toBe(401);
    expect(updateRes.body.status).toBe('error');
  });

  test('Updated fragment should have new updated timestamp', async () => {
    // Create a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/markdown')
      .send('# Heading');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;
    const originalUpdated = createRes.body.fragment.updated;

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update the fragment
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'text/markdown')
      .send('# New Heading');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.fragment.updated).not.toBe(originalUpdated);
    expect(new Date(updateRes.body.fragment.updated) > new Date(originalUpdated)).toBe(true);
  });

  test('Can update JSON fragment with valid JSON', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send('{"original": "data"}');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send('{"updated": "data"}');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.fragment.type).toBe('application/json');
  });

  test('Can update HTML fragment', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/html')
      .send('<h1>Original</h1>');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'text/html')
      .send('<h1>Updated</h1>');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.fragment.type).toBe('text/html');
  });

  test('Updated data is persisted correctly', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Original data');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // Update the fragment
    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Updated data');

    expect(updateRes.statusCode).toBe(200);

    // Retrieve and verify the updated data
    const getRes = await request(app).get(`/v1/fragments/${fragmentId}`).auth(user, pass);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.fragment.data).toBe('Updated data');
  });

  test('Update should include correct response headers', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Content');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    const updateRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Updated content');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.headers['location']).toBeDefined();
    expect(updateRes.headers['content-type']).toContain('application/json');
  });
});
