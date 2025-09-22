const request = require('supertest');

// express app instance
const app = require('../../src/app');

// get the version and author from package.json

const { version, author } = require('../../package.json');

describe('/ health check', () => {
  // test the / route
  test('Should return HTTP 200 response', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  // test headers
  test('Should return Cache-Control: no-cache header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['cache-control']).toBe('no-cache');
  });

  test('Should return status: ok in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.status).toBe('ok');
  });

  test('Should return correct version and author in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.version).toBe(version);
    expect(res.body.author).toBe(author);
  });
});
