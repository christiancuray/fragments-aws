const request = require('supertest');
const app = require('../../src/app.js');

describe('GET /v1/fragments/:id.:ext Tests', () => {
  test('should return 401 when user is not authenticated', async () => {
    const res = await request(app).get('/v1/fragments/test-id.html');
    expect(res.statusCode).toBe(401);
  });

  test('should return 404 when fragment does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id.html')
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment not found');
  });

  test('should return 415 when converting non-markdown to HTML', async () => {
    // Create a text/plain fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('Plain text content');

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    // Try to convert to HTML
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('should convert markdown to HTML successfully', async () => {
    // Create a markdown fragment
    const markdownContent = '# Hello World\n\nThis is **bold** text.';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/markdown')
      .send(markdownContent);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    // Convert to HTML
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Hello World</h1>');
    expect(res.text).toContain('<strong>bold</strong>');
  });

  test('should return 500 on internal server error', async () => {
    const Fragment = require('../../src/model/fragments');
    const originalById = Fragment.byId;

    Fragment.byId = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/v1/fragments/test-id.html')
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');

    Fragment.byId = originalById;
  });
});
