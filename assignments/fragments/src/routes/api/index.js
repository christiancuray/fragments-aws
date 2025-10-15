// fragments api endpoints

const express = require('express');
const authenticate = require('../../auth').authenticate;
// create a router for the fragments endpoints
const router = express.Router();

// define the fragments routes with authentication
router.get('/fragments', authenticate(), require('./get'));
router.post('/fragments', authenticate(), require('./post'));
// other routes will go here in the future ( POST, PUT, DELETE, etc)

module.exports = router;
