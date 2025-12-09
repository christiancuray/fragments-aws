const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  const user = 'user1@gmail.com';
  const pass = 'password123';

  test('Unauthenticated requests should be denied', async () => {
    const res = await request(app).delete('/v1/fragments/1234');
    expect(res.statusCode).toBe(401);
  });

  test('Authenticated user can delete their own fragment', async () => {
    // Create a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Content to delete');

    expect(createRes.statusCode).toBe(201);
    const fragmentId = createRes.body.fragment.id;

    // Delete it
    const deleteRes = await request(app).delete(`/v1/fragments/${fragmentId}`).auth(user, pass);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
    expect(deleteRes.body.message).toContain('deleted successfully');
  });

  test('Cannot delete non-existent fragment', async () => {
    const deleteRes = await request(app).delete('/v1/fragments/nonexistent').auth(user, pass);

    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.body.status).toBe('error');
  });

  test("Cannot delete another user's fragment", async () => {
    const user2 = 'user2@gmail.com';

    // User 1 creates a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Content');

    const fragmentId = createRes.body.fragment.id;

    // User 2 tries to delete it
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(user2, 'password123');

    expect(deleteRes.statusCode).toBe(401);
  });

  test('Deleted fragment cannot be retrieved', async () => {
    // Create a fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Content');

    const fragmentId = createRes.body.fragment.id;

    // Delete it
    const deleteRes = await request(app).delete(`/v1/fragments/${fragmentId}`).auth(user, pass);

    expect(deleteRes.statusCode).toBe(200);

    // Try to retrieve it
    const getRes = await request(app).get(`/v1/fragments/${fragmentId}`).auth(user, pass);

    expect(getRes.statusCode).toBe(404);
  });

  test('Delete response has correct headers', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('Content');

    const fragmentId = createRes.body.fragment.id;

    const deleteRes = await request(app).delete(`/v1/fragments/${fragmentId}`).auth(user, pass);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.headers['content-type']).toContain('application/json');
  });
});
