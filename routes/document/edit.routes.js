const express = require('express');
const router = express.Router();

const editController = require('../../controllers/document/edit.controller');

router.put('/:id', editController);

module.exports = router;

