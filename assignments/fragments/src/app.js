const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const logger = require('./logger');
const { createErrorResponse } = require('./response');
const contentType = require('content-type');

const pino = require('pino-http')({
  logger,
});

// express app instance
const app = express();

app.use(pino); // use pino for logging middleware

app.use(helmet()); // use helmet for security middleware

app.use(
  cors({
    exposedHeaders: ['Location'], // explicitly expose the Location header
  })
); // use CORS middleware so can make request from origins

app.use(compression()); // use gzip/deflate compression middleware

// Helper function to check if content type is supported
const isSupportedContentType = (type) => {
  const supportedTypes = ['application/json', 'text/plain', 'text/markdown', 'text/html'];
  return supportedTypes.includes(type);
};

// parse the raw body of incoming requests for supported content types up to 5MB size
const rawBody = () => {
  return express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      try {
        const { type } = contentType.parse(req);
        return isSupportedContentType(type);
      } catch (err) {
        // If there's no content-type header or it's invalid, return false
        logger.error({ err }, 'Error parsing content type');
        return false;
      }
    },
  });
};

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
app.use('/v1/fragments', rawBody());

if (authenticate.Strategy && authenticate.Strategy()) {
  passport.use(authenticate.Strategy());
}
app.use(passport.initialize());

// routes for the API
app.use('/', require('./routes')); // basic route to check if the server will run

// Add 404 middleware for unknown routes
app.use((req, res) => {
  logger.info('Returning 404 for unknown route');
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// add error handling middleware for any other errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, `Error proccesing request: ${message}`);
  }

  res.status(status).json({
    ...createErrorResponse(status, message),
    error: err,
  });
  next();
});
module.exports = app;

console.log('testing log to test assignment 2');
