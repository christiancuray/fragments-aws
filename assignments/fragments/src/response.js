// success response
module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    ...data,
  };
};

// error response
module.exports.createErrorResponse = function (code, message) {
  return {
    status: 'error',
    error: {
      code,
      message,
    },
  };
};
