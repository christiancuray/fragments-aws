// to gracefully shutdown server
const stoppable = require('stoppable');

//get the logger instance
const logger = require('./logger');

// express app instance
const app = require('./app');

// get port from environment or use default
const PORT = process.env.PORT || 1600;
console.log(PORT);

//start the server
const server = stoppable(
  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  })
);

module.exports = server;
