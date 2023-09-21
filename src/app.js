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

module.exports = app;
