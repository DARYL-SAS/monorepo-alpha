const express = require('express');
const router = express.Router();

const createController = require('../../controllers/project/create.controller');

router.post('/create', createController);

module.exports = router;
