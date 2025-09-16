const express = require('express');

const { version, author } = require('../../package.json');

const router = express.Router();

// expose all api route ton /v1/* to include the api version in the url
router.use(`/v1/`, require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  // send a 200 OK response
  res.status(200).json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/christiancuray/CCP555-2025F-NSD-Christian-Curay-cdcuray-Lab2',
  });
});

module.exports = router;
