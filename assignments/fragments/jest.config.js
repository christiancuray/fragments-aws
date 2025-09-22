// get the path of our env.jest file
const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

// read the env file for jest
require('dotenv').config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

module.exports = {
  verbose: true,
  testTimeout: 5000,
};
