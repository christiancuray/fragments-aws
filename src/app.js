const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// get the author and version from the package.json
const { author, version, repository } = require('../package.json');
const { url } = repository;
const logger = require('./logger');

const pino = require('pino-http')({
  logger,
});

// express app instance
const app = express();

// use pino for logging middleware
app.use(pino);

// use helmet for security middleware
app.use(helmet());

// use CORS middleware so can make request from origins
app.use(cors());

// use gzip/deflate compression middleware
app.use(compression());

// basic route to check if the server will run
app.get('/', (req, res) => {
  //client should not cache this response
  res.setHeader('Cache-Control', 'no-cache');

  res.status(200).json({
    status: 'ok',
    author,
    url,
    version,
  });
});

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
