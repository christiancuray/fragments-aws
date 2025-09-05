require('dotenv').config();

// 'info' as default log level if not specified
const options = {
  level: process.env.LOG_LEVEL || 'info',
};

// if the log level is debug, lets make the logs easier to read
if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

// export pino logger instance
module.exports = require('pino')(options);
