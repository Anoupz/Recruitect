'use strict';

var express = require('express');
var controller = require('./users.controller');

var router = express.Router();

router.get('/getUsers', controller.index);
router.post('/createUser', controller.createUser);

module.exports = router;
