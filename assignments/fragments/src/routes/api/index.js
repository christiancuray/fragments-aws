// fragments api endpoints

const express = require('express');
const authenticate = require('../../auth').authenticate;
// create a router for the fragments endpoints
const router = express.Router();

// define the fragments routes with authentication
router.get('/fragments', authenticate(), require('./get'));
router.post('/fragments', authenticate(), require('./post'));
router.get('/fragments/:id.:ext', authenticate(), require('./getConvertedFragment'));
router.get('/fragments/:id', authenticate(), require('./getById'));
router.get('/fragments/:id/info', authenticate(), require('./getInfoById'));
router.delete('/fragments/:id', authenticate(), require('./deleteById'));

// other routes will go here in the future ( PUT, DELETE, etc)

module.exports = router;
