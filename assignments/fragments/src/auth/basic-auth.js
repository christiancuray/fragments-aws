const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');

const logger = require('../logger');
logger.info('Using HTTP Basic Auth for Authentication');

if (!process.env.HTPASSWD_FILE) {
  throw new Error('Missing expected env var: HTPASSWD_FILE');
}

logger.info('Using HTTP Basic Auth for Authentication');

module.exports.Strategy = () => {
  return authPassport(auth.basic({ file: process.env.HTPASSWD_FILE }));
};

module.exports.authenticate = () => {
  return passport.authenticate('http', { session: false });
};
