const hash = require('../../src/hash');
const algorithm = 'sha256';
const crypto = require('crypto');

describe('hash function', () => {
  const fakeEmail = 'example@gmail.com';

  test('hashing a valid email should return a string', () => {
    const res = hash(fakeEmail);
    expect(typeof res).toBe('string');
  });

  test('hashing the same email should return the same hash', () => {
    const res1 = hash(fakeEmail);
    const res2 = hash(fakeEmail);
    expect(res1).toBe(res2);
  });

  test('hashing an invalid email should throw an error', () => {
    const invalidEmail = 123;
    expect(() => hash(invalidEmail)).toThrow('Email is required and must be a string');
  });

  test('hashing an empty email should return the same hash as the empty string', () => {
    const emptyEmail = '';
    const res = hash(emptyEmail);
    expect(res).toBe(crypto.createHash(algorithm).update('').digest('hex'));
  });
});
