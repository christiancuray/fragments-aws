// Checks if we have AWS Cognito variables defined at environment.
// If it exist, we are going to use the COGNITO JWT's strategy.
// If .htpasswd file path is define, we are going to use Basic Auth strategy.

// In development mode, allow Basic Auth to take precedence if HTPASSWD_FILE is explicitly set
// In production, prefer Cognito if both are configured
if (
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.HTPASSWD_FILE &&
  process.env.NODE_ENV
) {
  throw new Error(
    '[ERROR] env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed in production.'
  );
}

// In development, if HTPASSWD_FILE is set, use Basic Auth (even if Cognito vars are present)
if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
} else if (process.env.AWS_COGNITO_CLIENT_ID && process.env.AWS_COGNITO_POOL_ID) {
  // prefer amazon cognito (prod or when Basic Auth not explicitly set)
  module.exports = require('./cognito');
} else {
  throw new Error('[ERROR] Missing env vars: No authorization configuration found.');
}
