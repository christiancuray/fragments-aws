// Checks if we have AWS Cognito variables defined at environment.
// If it exist, we are going to use the COGNITO JWT's strategy.
// If .htpasswd file path is define, we are going to use Basic Auth strategy.

if (
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error(
    '[ERROR] env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

// prefer amazon cognito (prod)
if (process.env.AWS_COGNITO_CLIENT_ID && process.env.AWS_COGNITO_POOL_ID) {
  module.exports = require('./cognito');
} else if (process.env.HTPASSWD_FILE && process.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
} else {
  throw new Error('[ERROR] Missing env vars: No authorization configuration found.');
}
