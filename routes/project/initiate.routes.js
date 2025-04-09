const express = require('express');
const router = express.Router();

const initiateController = require('../../controllers/project/initiate.controller');

router.post('/initiate', initiateController); // logique d'initialisation d'un projet

module.exports = router;

