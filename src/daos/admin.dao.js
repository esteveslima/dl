const sequelize = require('sequelize');
const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const Profile = require('../models/entities/profile.model');
const Contract = require('../models/entities/contract.model');
const Job = require('../models/entities/job.model');

const { Op } = sequelize;

module.exports.getAggregatedPricePerProfession = async (start, end) => {
  const profileQueryResult = await Profile.findAll({
    include: {
      model: Contract,
      as: 'Contractor',
      include: [
        {
          model: Job,
          where: {
            paid: true,
            createdAt: {
              [Op.gt]: start,
              [Op.lt]: end,
            },
          },
        },
      ],
    },
    group: 'profession',
    attributes: [
      'profession',
      [sequelize.fn('SUM', sequelize.col('Contractor->Jobs.price')), 'jobsPricesTotalAmount'],
    ],
    includeIgnoreAttributes: false,
  });
  if (profileQueryResult.length === 0) throw new ResourceNotFoundException('Profile');

  const filteredResult = profileQueryResult.filter((result) => !!result.dataValues.jobsPricesTotalAmount);
  if (filteredResult.length === 0) throw new ResourceNotFoundException('Profile');

  const formattedResult = filteredResult.map((result) => result.dataValues);

  return formattedResult;
};

module.exports.findJobsOrderedByPriceDescending = async (start, end, limit) => {
  const DEFAULT_LIMIT = 2;

  const jobs = await Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.gt]: start,
        [Op.lt]: end,
      },
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
    order: [
      ['price', 'DESC'],
    ],
    limit: limit ?? DEFAULT_LIMIT,
  });
  if (jobs.length === 0) throw new ResourceNotFoundException('Profiles');

  return jobs;
};
