const express = require('express');
const { hostname } = require('os');

const { version, author } = require('../../package.json');

const router = express.Router();
const { createSuccessResponse } = require('../response');

// expose all api route ton /v1/* to include the api version in the url
router.use(`/v1/`, require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  // send a 200 OK response
  res.status(200).json(
    createSuccessResponse({
      author,
      version,
      githubUrl: 'https://github.com/christiancuray/fragments',
      hostname: hostname(),
    })
  );
});

module.exports = router;
