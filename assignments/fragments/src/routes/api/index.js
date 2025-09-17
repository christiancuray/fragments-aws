// fragments api endpoints

const express = require('express');

const router = express.Router();

// define the fragments routes
router.get('/fragments', require('./get'));

// other routes will go here in the future ( POST, PUT, DELETE, etc)

module.exports = router;
