const express = require('express');
const router = express.Router();
const readController = require('../../controllers/document/read.controller');

router.get('/:id', readController);

module.exports = router;
