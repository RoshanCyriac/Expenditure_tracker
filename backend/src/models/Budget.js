const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'monthly'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Budget; 