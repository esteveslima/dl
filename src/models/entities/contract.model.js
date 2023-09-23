const Sequelize = require('sequelize');
const dbconfig = require('../../config/dbconfig');

class Contract extends Sequelize.Model {}

Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize: dbconfig,
    modelName: 'Contract',
  },
);

// Contract.belongsTo(Profile, { as: 'Contractor' });
// Contract.belongsTo(Profile, { as: 'Client' });
// Contract.hasMany(Job);

module.exports = Contract;
