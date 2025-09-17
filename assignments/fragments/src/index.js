require('dotenv').config();

const logger = require('./logger');

process.on('uncaughtException', (err, origin) => {
  logger.error('Uncaught Exception', { err, origin });
  throw err;
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  throw reason;
});

require('./server');
