'use strict';
import controller from './users.controller';
import express from 'express';

var router = express.Router();

router.get('/getUsers', controller.index);
router.post('/createUser', controller.createUser);

module.exports = router;
