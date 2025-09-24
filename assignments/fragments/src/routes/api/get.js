const { createSuccessResponse } = require('../../response');

// GET /v1/fragments handler
module.exports = (req, res) => {
  // this is a placeholder response. To get something working, return an empty array.
  res.status(200).json(
    createSuccessResponse({
      fragments: [],
      message: 'GET /v1/fragments endpoint is working fine',
    })
  );
};
