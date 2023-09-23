const express = require('express');
const { findBestProfession, findBestClients } = require('../controllers/admin.controller');

const router = express.Router();

router.get('/admin/best-profession', findBestProfession);
router.get('/admin/best-clients', findBestClients);

module.exports = router;
