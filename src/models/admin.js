const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adminName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  adminPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  adminEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  adminPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// sequelize.sync()
//   .then(() => console.log('Admin model synced with database'))
//   .catch((err) => console.log('Error syncing the model:', err));

module.exports = Admin;
