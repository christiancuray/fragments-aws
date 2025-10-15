const hash = require('../../src/hash');

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
});
