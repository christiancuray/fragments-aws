module.exports = (req, res) => {
  // this is a placeholder response. To get something working, return an empty array.
  res.status(200).json({
    status: 'ok',
    fragments: [],
    message: 'GET /v1/fragments endpoint is working fine',
  });
};
