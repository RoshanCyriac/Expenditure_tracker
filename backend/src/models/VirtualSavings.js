const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VirtualSavings = sequelize.define('VirtualSavings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  dailyBudget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  actualSpent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

module.exports = VirtualSavings; 