const request = require('supertest');
const app = require('../../src/app.js');

describe('Test POST /v1/fragments', () => {
  test('should return a 401 status code if the user is not authenticated', async () => {
    const res = await request(app).post('/v1/fragments');
    expect(res.statusCode).toBe(401);
  });

  test('should return a 415 status code if the content type is missing', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', '');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Content-Type header is missing');
  });

  test('should return a 415 status code if the content type is not supported', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'unsupportedType');
    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe('Unsupported Media Type: unsupportedType');
  });

  test('should return 201 status code if fragment is created successfully', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('Hello, World!');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(13);
    expect(res.headers.location).toBeDefined();
  });

  test('should return 500 status code if there is an error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('ERROR500');

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toBe('Internal server error');
  });
});
