const sequelize = require('sequelize');
const ResourceNotFoundException = require('../exceptions/resource-not-found.exception');
const Contract = require('../models/entities/contract.model');

const { Op } = sequelize;

module.exports.getContract = async (contractId, profileId) => {
  const contract = await Contract.findOne({
    where: {
      id: contractId,
      [Op.or]: [
        { ContractorId: profileId },
        { ClientId: profileId },
      ],
    },
  });
  if (!contract) throw new ResourceNotFoundException('contract');

  return contract;
};

module.exports.findContracts = async (profileId) => {
  const TERMINATED_CONTRACT_STATUS = 'terminated';

  const contracts = await Contract.findAll({
    where: {
      status: { [Op.ne]: TERMINATED_CONTRACT_STATUS },
      [Op.or]: [
        { ContractorId: profileId },
        { ClientId: profileId },
      ],
    },
  });
  if (contracts.length === 0) throw new ResourceNotFoundException('contracts');

  return contracts;
};
