const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const FixedCost = sequelize.define('FixedCost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
});

// Each user has many fixed costs
User.hasMany(FixedCost);
FixedCost.belongsTo(User);

module.exports = FixedCost; 