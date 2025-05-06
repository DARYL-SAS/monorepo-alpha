const express = require('express');
const router = express.Router();
const listDocuments = require('../../controllers/document/read.controller');

router.get('/', listDocuments);

module.exports = router;
