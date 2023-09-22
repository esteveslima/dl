const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { id } = req.params;
  const profileId = req.profile.id;

  const { Contract } = req.app.get('models');
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        { ContractorId: profileId },
        { ClientId: profileId },
      ],
    },
  });
  if (!contract) return res.status(404).end();

  return res.json(contract);
});

/**
 * @returns list of non terminated contracts
 */
app.get('/contracts', getProfile, async (req, res) => {
  const profileId = req.profile.id;

  const { Contract } = req.app.get('models');
  const contracts = await Contract.findAll({
    where: {
      status: { [Op.ne]: 'terminated' },
      [Op.or]: [
        { ContractorId: profileId },
        { ClientId: profileId },
      ],
    },
  });
  if (contracts.length === 0) return res.status(404).end();

  return res.json(contracts);
});

/**
 * @returns list of unpaid jobs from active contracts for a user
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const profileId = req.profile.id;

  const { Contract } = req.app.get('models');
  const { Job } = req.app.get('models');

  const jobs = await Job.findAll({
    where: {
      paid: { [Op.not]: true },
    },
    include: {
      model: Contract,
      where: {
        status: 'in_progress',
        [Op.or]: [
          { ContractorId: profileId },
          { ClientId: profileId },
        ],
      },
    },
    includeIgnoreAttributes: false,
  });
  if (jobs.length === 0) return res.status(404).end();

  return res.json(jobs);
});

/**
 * Makes the contract payment from the client to the contractor
 * @returns status code reflecting the operation result
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const { job_id } = req.params;
  const clientProfileId = req.profile.id;

  const { Job } = req.app.get('models');
  const { Contract } = req.app.get('models');
  const { Profile } = req.app.get('models');

  const job = await Job.findOne({
    where: {
      id: job_id,
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
  if (!job) return res.status(404).end();
  if (job.Contract.ClientId !== clientProfileId) return res.status(404).end();

  if (job.Contract.status !== 'in_progress') return res.status(400).json({ message: 'Contract not active!' }).end();
  // if (job.Contract.Client.balance < job.price) return res.status(400).json({ message: 'Insufficient balance!' }).end();

  const transaction = await sequelize.transaction();
  try {
    const [decrementResult, incrementResult] = await Promise.all([
      Profile.decrement(
        {
          balance: job.price,
        },
        {
          where: {
            id: job.Contract.ClientId,
            balance: {
              [Op.gte]: job.price,
            },
          },
        },
      ),
      Profile.increment(
        {
          balance: job.price,
        },
        {
          where: {
            id: job.Contract.ContractorId,
          },
        },
      ),
    ]);

    const [[_, rowsAffected]] = decrementResult;
    if (rowsAffected === 0) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Insufficient balance!' }).end();
    }

    await transaction.commit();
  } catch (exception) {
    console.log(exception);
    return res.status(500).json({ message: 'Failed to make payment!' }).end();
  }

  return res.status(200).end();
});

module.exports = app;
