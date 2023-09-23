const express = require('express');
const bodyParser = require('body-parser');

require('../models/associations');

const contractRouter = require('../routers/contract.router');
const paymentRouter = require('../routers/payment.router');
const adminRouter = require('../routers/admin.router');

const app = express();
app.use(bodyParser.json());

app.use(contractRouter);
app.use(paymentRouter);
app.use(adminRouter);

module.exports = app;
