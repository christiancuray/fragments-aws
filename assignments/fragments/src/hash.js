const crypto = require('crypto');
const algorithm = 'sha256';
const secret = process.env.SECRET_HASH || 'secret';

function hash(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  if (email.length === 0) {
    return crypto.createHash(algorithm).update('').digest('hex');
  }
  const hash = crypto.createHmac(algorithm, secret);
  return hash.update(email).digest('hex');
}

module.exports = hash;
