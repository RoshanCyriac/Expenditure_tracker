const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingsTarget = sequelize.define('SavingsTarget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  period: {
    type: DataTypes.ENUM('daily', 'monthly', 'yearly'),
    allowNull: false
  }
});

module.exports = SavingsTarget; 