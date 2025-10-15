const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const authorize = require('./auth-middleware');

const logger = require('../logger');
logger.info('Using HTTP Basic Auth for Authentication');

if (!process.env.HTPASSWD_FILE) {
  throw new Error('Missing expected env var: HTPASSWD_FILE');
}

module.exports.Strategy = () => {
  return authPassport(auth.basic({ file: process.env.HTPASSWD_FILE }));
};

logger.info('Using HTTP Basic Auth for Authentication');

module.exports.authenticate = () => {
  return authorize('http');
};
