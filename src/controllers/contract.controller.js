const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');

const contractService = require('../services/contract.service');

/**
* @returns contract by id
*/
module.exports.getContract = async (req, res) => {
  const { id } = req.params;
  const profileId = req.profile.id;

  try {
    const contract = await contractService.getContract(id, profileId);
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
* @returns list of non terminated contracts
*/
module.exports.findContracts = async (req, res) => {
  const profileId = req.profile.id;

  try {
    const contracts = await contractService.findContracts(profileId);
    return res.status(200).json(contracts).end();
  } catch (exception) {
    if (exception instanceof ResourceNotFoundException) {
      return res.status(404).json({ message: exception.message }).end();
    }
    console.log(exception);
    return res.status(500).json({ message: 'Internal Error!' }).end();
  }
};
