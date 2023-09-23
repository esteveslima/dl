const contractDao = require('../daos/contract.dao');

module.exports.getContract = async (contractId, profileId) => {
  const contract = await contractDao.getContract(contractId, profileId);

  return contract;
};

module.exports.findContracts = async (profileId) => {
  const contracts = await contractDao.findContracts(profileId);

  return contracts;
};
