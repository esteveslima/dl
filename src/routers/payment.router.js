const express = require('express');
const { getProfile } = require('../middlewares/getProfile');
const { findUnpaidJobs, makeContractorJobPayment, makeClientDeposit } = require('../controllers/payment.controller');

const router = express.Router();

router.get('/jobs/unpaid', getProfile, findUnpaidJobs);
router.post('/jobs/:job_id/pay', getProfile, makeContractorJobPayment);
router.post('/balances/deposit/:userId', getProfile, makeClientDeposit);

module.exports = router;
