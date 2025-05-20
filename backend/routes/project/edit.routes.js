const express = require('express');
const router = express.Router();

const editController = require('../../controllers/project/edit.controller');

router.put('/:id', editController); // édition par ID

module.exports = router;
