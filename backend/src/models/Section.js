const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
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

// Each user has many sections
User.hasMany(Section);
Section.belongsTo(User);

module.exports = Section; 