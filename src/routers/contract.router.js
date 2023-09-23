const express = require('express');
const { getProfile } = require('../middlewares/getProfile');
const { getContract, findContracts } = require('../controllers/contract.controller');

const router = express.Router();

router.get('/contracts/:id', getProfile, getContract);
router.get('/contracts', getProfile, findContracts);

module.exports = router;
