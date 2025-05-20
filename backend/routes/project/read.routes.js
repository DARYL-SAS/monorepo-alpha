const express = require('express');
const router = express.Router();

const readController = require('../../controllers/project/read.controller');

router.get('/:id', readController); // lecture par ID

module.exports = router;
