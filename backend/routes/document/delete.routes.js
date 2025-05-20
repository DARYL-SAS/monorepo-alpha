const express = require('express');
const router = express.Router();

const deleteController = require('../../controllers/document/delete.controller');

router.delete('/delete/:filename', deleteController);

module.exports = router;

