const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const logger = require("../utils/logger");

const AbsentChoirMember = sequelize.define("AbsentChoirMember", {
  choirMemberId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  choirMemberFirstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  choirMemberLastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  choirMemberGender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  choirMemberPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  churchAbsentRate: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  repetitionAbsentRate: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  weddingAbsentRate: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deathAbsentRate: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true
});

module.exports = AbsentChoirMember;
