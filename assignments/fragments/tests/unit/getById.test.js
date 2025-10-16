const request = require('supertest');
const app = require('../../src/app.js');
const logger = require('../../src/logger');

describe('GET /v1/fragments/:id Tests', () => {
  let createdFragmentId;
  const testContent = 'This is a test fragment for getById testing';

  // create a fragment to test with before all tests
  beforeAll(async () => {
    try {
      const res = await request(app)
        .post('/v1/fragments')
        .auth('user1@gmail.com', 'password123')
        .set('Content-Type', 'text/plain')
        .send(testContent);

      if (res.statusCode === 201) {
        createdFragmentId = res.body.fragment.id;
        logger.info(`Created test fragment with ID: ${createdFragmentId}`);
      } else {
        logger.error('Failed to create test fragment:', res.body);
      }
    } catch (error) {
      logger.error('Error in beforeAll:', error);
    }
  });

  // Cleanup: Remove the test fragment after all tests
  afterAll(async () => {
    if (createdFragmentId) {
      try {
        logger.info(`Test fragment ${createdFragmentId} would be cleaned up here`);
      } catch (error) {
        logger.error('Error in afterAll cleanup:', error);
      }
    }
  });

  describe('Authentication Tests', () => {
    test('should return 401 when no authorization header is provided', async () => {
      const res = await request(app).get('/v1/fragments/test-id');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(401);
      expect(res.body.error.message).toBe('Unauthorized');
    });

    test('should return 401 when invalid credentials are provided', async () => {
      const res = await request(app)
        .get('/v1/fragments/test-id')
        .auth('invalidUser', 'invalidPassword');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(401);
      expect(res.body.error.message).toBe('Unauthorized');
    });

    test('should return 401 when wrong password is provided', async () => {
      const res = await request(app)
        .get('/v1/fragments/test-id')
        .auth('user1@gmail.com', 'wrongpassword');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(401);
      expect(res.body.error.message).toBe('Unauthorized');
    });

    test('should return 404 when accessing fragment with non-existent user', async () => {
      // This should return 401 since user2 doesn't exist in the auth system
      const res = await request(app)
        .get(`/v1/fragments/${createdFragmentId}`)
        .auth('nonexistent@gmail.com', 'password123');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(401);
      expect(res.body.error.message).toBe('Unauthorized');
    });
  });

  describe('Fragment Not Found Tests', () => {
    test('should return 404 when fragment ID does not exist', async () => {
      const res = await request(app)
        .get('/v1/fragments/non-existent-fragment-id')
        .auth('user1@gmail.com', 'password123');

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(404);
      expect(res.body.error.message).toBe('Fragment not found');
    });
  });

  describe('Successful Fragment Retrieval Tests', () => {
    test('should successfully retrieve fragment with valid ID and authentication', async () => {
      const res = await request(app)
        .get(`/v1/fragments/${createdFragmentId}`)
        .auth('user1@gmail.com', 'password123');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toBeDefined();
    });

    test('should return correct fragment metadata', async () => {
      const res = await request(app)
        .get(`/v1/fragments/${createdFragmentId}`)
        .auth('user1@gmail.com', 'password123');

      expect(res.statusCode).toBe(200);

      const fragment = res.body.fragment;
      expect(fragment.id).toBe(createdFragmentId);
      expect(fragment.data).toBe(testContent);
      expect(fragment.type).toBe('text/plain');
      expect(fragment.size).toBe(testContent.length);
      expect(fragment.ownerId).toBeDefined();
      expect(fragment.created).toBeDefined();
      expect(fragment.updated).toBeDefined();
    });

    test('should return fragment data as string', async () => {
      const res = await request(app)
        .get(`/v1/fragments/${createdFragmentId}`)
        .auth('user1@gmail.com', 'password123');

      expect(res.statusCode).toBe(200);

      const fragment = res.body.fragment;
      expect(typeof fragment.data).toBe('string');
      expect(fragment.data).toBe(testContent);

      // Test that it returns the correct data
      expect(fragment.data).toMatch(/This is a test fragment for getById testing/);
    });
  });
});
