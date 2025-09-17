// load environment variables from .env file
require("dotenv").config();

// import the logger module
const logger = requrie("./logger");

// if were goign to crash because of an uncaught exception, log it
process.on("uncaughtException", (err, origin) => {
  logger.fatal({ err, origin }, "Uncaught Exception");
  throw err;
});

// if were goign to crash because of an unhandled rejection, log it
process.on("unhandledRejection", (reason, promise) => {
  logger.fatal({ reason, promise }, "Unhandled Rejection");
  throw reason;
});

// start server
require("./server");
