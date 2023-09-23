const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const InvalidRequestException = require('../exceptions/invalid-request.exception');

const paymentService = require('../services/payment.service');

/**
 * @returns list of unpaid jobs from active contracts for a user
 */
module.exports.findUnpaidJobs = async (req, res) => {
  const profileId = req.profile.id;

  try {
    const jobs = await paymentService.findUnpaidJobs(profileId);
    return res.status(200).json(jobs).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};

/**
 * Makes the contract payment from the client to the contractor
 * @returns status code reflecting the operation result
 */
module.exports.makeContractorJobPayment = async (req, res) => {
  const { job_id } = req.params;
  const clientId = req.profile.id;

  try {
    await paymentService.makeContractorJobPayment(job_id, clientId);
    return res.status(200).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    if (exception instanceof InvalidRequestException) {
      return res.status(400).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};

/**
 * Adds balance to a client
 * @returns status code reflecting the operation result
 */
// P.S.: assuming it is an API open for any profile ID given there's a path parameter, otherwise it would be better to use the id from the header
// P.S.2: accepting the risk of not using a single db request or transaction as the consequences doesn't seem to be bad
module.exports.makeClientDeposit = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  try {
    await paymentService.makeClientDeposit(userId, amount);
    return res.status(200).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    if (exception instanceof InvalidRequestException) {
      return res.status(400).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};
