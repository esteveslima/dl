const sequelize = require('sequelize');
const dbconfig = require('../config/dbconfig');
const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const InvalidRequestException = require('../exceptions/invalid-request.exception');
const Profile = require('../models/entities/profile.model');
const Contract = require('../models/entities/contract.model');
const Job = require('../models/entities/job.model');

const { Op } = sequelize;

module.exports.findUnpaidJobs = async (profileId) => {
  const ACTIVE_CONTRACT_STATUS = 'in_progress';

  const jobs = await Job.findAll({
    where: {
      paid: { [Op.not]: true },
    },
    include: {
      model: Contract,
      where: {
        status: ACTIVE_CONTRACT_STATUS,
        [Op.or]: [
          { ContractorId: profileId },
          { ClientId: profileId },
        ],
      },
    },
    includeIgnoreAttributes: false,
  });
  if (jobs.length === 0) throw new ResourceNotFoundException('Jobs');

  return jobs;
};

module.exports.findClientJobToBePaid = async (jobId) => {
  const job = await Job.findOne({
    where: {
      id: jobId,
    },
    include: {
      model: Contract,
      include: [
        {
          model: Profile,
          as: 'Client',
        },
      ],
    },
  });
  if (!job) throw new ResourceNotFoundException('Job');

  return job;
};

module.exports.makeContractorJobPayment = async (jobId, clientId, contractorId, amount) => {
  const transaction = await dbconfig.transaction();

  try {
    const [decrementResult, incrementResult, jobUpdateResult] = await Promise.all([
      Profile.decrement(
        {
          balance: amount,
        },
        {
          where: {
            id: clientId,
            balance: {
              [Op.gte]: amount,
            },
          },
        },
      ),
      Profile.increment(
        {
          balance: amount,
        },
        {
          where: {
            id: contractorId,
          },
        },
      ),
      Job.update(
        {
          paid: true,
          paymentDate: new Date(),
        },
        {
          where: {
            id: jobId,
          },
        },
      ),
    ]);

    const [[_, rowsAffectedDecrement]] = decrementResult;
    const isDecrementSuccessful = rowsAffectedDecrement === 1;
    if (!isDecrementSuccessful) {
      await transaction.rollback();
      throw new InvalidRequestException('insufficient balance');
    }

    const [[__, rowsAffectedIncrement]] = incrementResult;
    const isIncrementSuccessful = rowsAffectedIncrement === 1;
    if (!isIncrementSuccessful) {
      await transaction.rollback();
      throw new Error('increment failed');
    }

    // check job update
    const [rowsAffectedJobUpdate] = jobUpdateResult;
    const isJobUpdateSuccessful = rowsAffectedJobUpdate === 1;
    if (!isJobUpdateSuccessful) {
      await transaction.rollback();
      throw new Error('job update failed');
    }

    await transaction.commit();
  } catch (exception) {
    await transaction.rollback();
    console.log(exception);
    throw new Error('failed to make payment');
  }
};

module.exports.getClientJobsTotalToPay = async (profileId) => {
  const ACTIVE_CONTRACT_STATUS = 'in_progress';

  const profileQueryResult = await Profile.findOne({
    where: {
      id: profileId,
    },
    include: {
      model: Contract,
      as: 'Client',
      where: {
        status: ACTIVE_CONTRACT_STATUS,
      },
      include: [
        {
          model: Job,
          where: {
            paid: { [Op.not]: true },
          },
        },
      ],
    },
    attributes: [
      'id',
      [sequelize.fn('SUM', sequelize.col('Client->Jobs.price')), 'jobsPricesTotalAmount'],
    ],
    includeIgnoreAttributes: false,
  });

  const { id, jobsPricesTotalAmount } = profileQueryResult.dataValues;
  if (!jobsPricesTotalAmount) throw new InvalidRequestException('no reference of jobs to pay found');

  return jobsPricesTotalAmount;
};

module.exports.makeClientDeposit = async (profileId, amount) => {
  await Profile.increment(
    {
      balance: amount,
    },
    {
      where: {
        id: profileId,
      },
    },
  );
};
