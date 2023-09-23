const adminDao = require('../daos/admin.dao');

module.exports.findBestProfession = async (start, end) => {
  const aggregatedPricesPerProfession = await adminDao.getAggregatedPricePerProfession(start, end);

  const orderedAggregatedPricesPerProfession = aggregatedPricesPerProfession.sort((a, b) => b.jobsPricesTotalAmount - a.jobsPricesTotalAmount);

  const bestProfession = orderedAggregatedPricesPerProfession[0].profession;

  return { bestProfession };
};

module.exports.findBestClients = async (start, end, limit) => {
  const orderedJobs = await adminDao.findJobsOrderedByPriceDescending(start, end, limit);

  const formattedResult = orderedJobs.map((record) => ({
    id: record.dataValues.Contract.Client.id,
    fullName: `${record.dataValues.Contract.Client.firstName} ${record.dataValues.Contract.Client.lastName}`,
    paid: record.dataValues.price,
  }));

  return formattedResult;
};
