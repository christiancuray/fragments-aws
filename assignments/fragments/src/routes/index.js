const express = require('express');

const { version, author } = require('../../package.json');

const router = express.Router();
const auth = require('../auth');

// expose all api route ton /v1/* to include the api version in the url
router.use(`/v1/`, auth.authenticate(), require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  // send a 200 OK response
  res.status(200).json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/christiancuray/fragments',
  });
});

module.exports = router;
