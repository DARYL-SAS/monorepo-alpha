const express = require('express');
const router = express.Router();

const deleteController = require('../../controllers/document/delete.controller');

router.delete('/:id', deleteController);

module.exports = router;

