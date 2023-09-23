const express = require('express');
const bodyParser = require('body-parser');

require('./models/associations');

const contractRouter = require('./routers/contract.router');
const paymentRouter = require('./routers/payment.router');
const adminRouter = require('./routers/admin.router');

const app = express();
app.use(bodyParser.json());

app.use(contractRouter);
app.use(paymentRouter);
app.use(adminRouter);

try {
  app.listen(3001, () => {
    console.log('Express App Listening on Port 3001');
  });
} catch (error) {
  console.error(`An error occurred: ${JSON.stringify(error)}`);
  process.exit(1);
}
