const Sequelize = require('sequelize');
const dbconfig = require('../../config/dbconfig');

class Job extends Sequelize.Model {}

Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize: dbconfig,
    modelName: 'Job',
  },
);

// Job.belongsTo(Contract);

module.exports = Job;
