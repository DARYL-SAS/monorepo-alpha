const express = require('express');
const router = express.Router();

const deleteController = require('../../controllers/project/delete.controller');

router.delete('/:id', deleteController); // suppression par ID

module.exports = router;
