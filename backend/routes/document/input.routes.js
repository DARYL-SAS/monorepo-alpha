const express = require('express');
const router = express.Router();
const inputController = require('../../controllers/document/input.controller');

router.post('/', inputController);

module.exports = router;

