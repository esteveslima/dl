const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');

const adminService = require('../services/admin.service');

/**
 * @returns the profession that earned the most money within a time range
 */
module.exports.findBestProfession = async (req, res) => {
  const { start, end } = req.query;

  try {
    const contract = await adminService.findBestProfession(start, end);
    return res.status(200).json(contract).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};

/**
 * @returns the clients that payed the most for jobs within a time range
 */
// P.S.: Assuming it should follow the example in the README.md and return the paird jobs individually and not the aggregated sum per client
module.exports.findBestClients = async (req, res) => {
  const { start, end, limit } = req.query;

  try {
    const contracts = await adminService.findBestClients(start, end, limit);
    return res.status(200).json(contracts).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};
