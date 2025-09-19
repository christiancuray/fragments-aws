const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const logger = require('./logger');

const pino = require('pino-http')({
  logger,
});

// express app instance
const app = express();

app.use(pino); // use pino for logging middleware

app.use(helmet()); // use helmet for security middleware

app.use(cors()); // use CORS middleware so can make request from origins

app.use(compression()); // use gzip/deflate compression middleware

passport.use(authenticate.Strategy());

app.use(passport.initialize());

app.use('/', require('./routes')); // basic route to check if the server will run

// add 404 middleware for unknown routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// add error handling middleware for any other errors
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, `Error proccesing request: ${message}`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
    next: err,
  });
});
module.exports = app;
