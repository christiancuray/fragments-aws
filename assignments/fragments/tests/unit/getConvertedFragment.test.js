const request = require('supertest');
const app = require('../../src/app.js');

describe('GET /v1/fragments/:id.:ext Tests', () => {
  // Authentication and basic error handling tests
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

  // CSV conversions
  test('should convert CSV to JSON', async () => {
    const csvContent = 'name,age\nJohn,30\nJane,25';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/csv')
      .send(csvContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toEqual({ name: 'John', age: '30' });
  });

  test('should convert CSV to plain text', async () => {
    const csvContent = 'col1,col2\nval1,val2';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/csv')
      .send(csvContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  // HTML conversions
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

  test('should return 200 when converting HTML to HTML', async () => {
    const htmlContent = '<h1>Hello World</h1>';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/html')
      .send(htmlContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });

  test('should convert HTML to plain text', async () => {
    const htmlContent = '<h1>Hello</h1><p>World</p>';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/html')
      .send(htmlContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toBe(htmlContent);
  });

  // JSON conversions
  test('should return 200 when converting JSON to JSON', async () => {
    const jsonContent = JSON.stringify({ name: 'John', age: 30 });
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'application/json')
      .send(jsonContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

  test('should convert JSON to YAML', async () => {
    const jsonContent = JSON.stringify({ name: 'John', age: 30 });
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'application/json')
      .send(jsonContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.yaml`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/yaml');
    expect(res.text).toContain("name: 'John'");
    expect(res.text).toContain('age: 30');
  });

  test('should convert JSON to plain text', async () => {
    const jsonContent = JSON.stringify({ test: 'data' });
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'application/json')
      .send(jsonContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  test('should handle invalid JSON in JSON to YAML conversion', async () => {
    const Fragment = require('../../src/model/fragments');
    const fragment = new Fragment({
      id: 'test-id',
      ownerId: 'user1@gmail.com',
      type: 'application/json',
      size: 100,
    });

    // Mock getData to return invalid JSON
    fragment.getData = jest.fn().mockResolvedValue(Buffer.from('invalid json'));

    const spy = jest.spyOn(Fragment, 'byId').mockResolvedValue(fragment);

    const res = await request(app)
      .get(`/v1/fragments/test-id.yaml`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('Invalid JSON');

    spy.mockRestore();
  });

  // Markdown conversions
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

  test('should convert markdown to plain text', async () => {
    const markdownContent = '# Hello\n**bold**';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/markdown')
      .send(markdownContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toBe(markdownContent);
  });

  // Plain text conversions
  test('should return plain text conversion for text/plain to txt', async () => {
    const textContent = 'Hello World';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send(textContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toBe(textContent);
  });

  // Image conversions
  test('should convert PNG image to PNG', async () => {
    const imageData = Buffer.from('This is a PNG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/png')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  test('should convert JPEG image to JPEG', async () => {
    const imageData = Buffer.from('This is a JPEG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/jpeg')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.jpg`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
  });

  test('should convert WebP image to WebP', async () => {
    const imageData = Buffer.from('This is a WebP image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/webp')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.webp`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/webp');
  });

  test('should convert GIF image to GIF', async () => {
    const imageData = Buffer.from('This is a GIF image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/gif')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.gif`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/gif');
  });

  test('should convert AVIF image to AVIF', async () => {
    const imageData = Buffer.from('This is an AVIF image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/avif')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.avif`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/avif');
  });

  test('should convert PNG image to JPEG', async () => {
    const imageData = Buffer.from('This is a PNG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/png')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.jpg`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/jpeg');
  });

  test('should convert PNG image to WebP', async () => {
    const imageData = Buffer.from('This is a PNG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/png')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.webp`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/webp');
  });

  test('should convert JPEG image to PNG', async () => {
    const imageData = Buffer.from('This is a JPEG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/jpeg')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  test('should convert JPEG image to WebP', async () => {
    const imageData = Buffer.from('This is a JPEG image');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'image/jpeg')
      .send(imageData);

    expect(postRes.statusCode).toBe(201);
    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.webp`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/webp');
  });

  // Unsupported conversions
  test('should return 200 when converting YAML to YAML', async () => {
    const yamlContent = 'name: John\nage: 30';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'application/yaml')
      .send(yamlContent);

    const fragmentId = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.yaml`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/yaml');
  });

  test('should return 415 for unsupported conversion', async () => {
    // Create a text/plain fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@gmail.com', 'password123')
      .set('Content-Type', 'text/plain')
      .send('Plain text');

    const fragmentId = postRes.body.fragment.id;

    // Try invalid conversion
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.pdf`)
      .auth('user1@gmail.com', 'password123');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toContain('Cannot convert');
  });
});
