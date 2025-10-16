const crypto = require('crypto');
const algorithm = 'sha256';
const secret = process.env.SECRET_HASH || 'secret';
const logger = require('./logger');

function hash(email) {
  if (email.length === 0) {
    logger.warn('Email is required and must be a string');
    return crypto.createHash(algorithm).update('').digest('hex');
  }
  if (!email || typeof email !== 'string') {
    logger.warn('Email is required and must be a string');
    throw new Error('Email is required and must be a string');
  }

  const hash = crypto.createHmac(algorithm, secret);
  return hash.update(email).digest('hex');
}

module.exports = hash;
