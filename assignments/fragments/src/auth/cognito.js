const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

// get the logger instance
const logger = require('../logger');

const authorize = require('./auth-middleware');

// check if we have cognito client id and pool id
if (!(process.env.AWS_COGNITO_CLIENT_ID && process.env.AWS_COGNITO_POOL_ID)) {
  throw new Error('Missing expected env vars AWS_COGNITO_CLIENT_ID and AWS_COGNITO_POOL_ID');
}

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

logger.info('Configured to use AWS Cognito for Authentication');

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS keys downloaded and cached');
  })
  .catch((err) => {
    logger.error('Error downloading Cognito JWKS keys', { err });
  });

// For our Passport authentication strategy, we'll look for the Bearer Token
// in the Authorization header, then verify that with our Cognito JWT Verifier.
module.exports.Strategy = () => {
  return new BearerStrategy(async (token, done) => {
    try {
      // verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'Verified user token');

      // pass the user's email as the identifier to the next middleware
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'Could not validate user token');
      done(null, false);
    }
  });
};

module.exports.authenticate = () => {
  return authorize('bearer');
};
