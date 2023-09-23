const paymentDao = require('../daos/payment.dao');
const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const InvalidRequestException = require('../exceptions/invalid-request.exception');

module.exports.findUnpaidJobs = async (profileId) => {
  const contract = await paymentDao.findUnpaidJobs(profileId);

  return contract;
};

module.exports.makeContractorJobPayment = async (jobId, clientId) => {
  const jobToBePaid = await paymentDao.findClientJobToBePaid(jobId);
  const { Contract } = jobToBePaid;

  const jobBelongsToClient = Contract.ClientId === clientId;
  if (!jobBelongsToClient) throw new ResourceNotFoundException('Job');

  const isJobAlreadyPaid = !!jobToBePaid.paid;
  if (isJobAlreadyPaid) throw new InvalidRequestException('job already paid');

  const ACTIVE_CONTRACT_STATUS = 'in_progress';
  const isContractActive = Contract.status === ACTIVE_CONTRACT_STATUS;
  if (!isContractActive) throw new InvalidRequestException('contract not active');

  const clientHasEnoughBalance = Contract.Client.balance >= jobToBePaid.price;
  if (!clientHasEnoughBalance) throw new InvalidRequestException('not enough balance');

  await paymentDao.makeContractorJobPayment(jobToBePaid.id, clientId, Contract.ContractorId, jobToBePaid.price);
};

module.exports.makeClientDeposit = async (clientId, amount) => {
  const clientJobsTotalToPay = await paymentDao.getClientJobsTotalToPay(clientId);

  const depositLimit = clientJobsTotalToPay * 0.25;
  if (amount > depositLimit) throw new InvalidRequestException(`amount exceding the deposit limit (${depositLimit}: 25% of ${clientJobsTotalToPay})`);

  await paymentDao.makeClientDeposit(clientId, amount);
};
