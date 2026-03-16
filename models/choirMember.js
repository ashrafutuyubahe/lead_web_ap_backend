const {DataTypes} = require("sequelize");
const sequelize= require("../config/db");
const logger= require("../utils/logger");



const choirMember= sequelize.define("ChoirMember",{

  choirMemberId:{
    type: DataTypes.INTEGER,
    unique:true,
    primaryKey:true,
    autoIncrement:true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, 
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM,
    values: ['member', 'attendance_taker', 'admin'],
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'inactive'],
    defaultValue: 'active'
  },
  choirMemberFirstName:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  choirMemberLastName:{
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
  voiceType: {
    type: DataTypes.ENUM,
    values: ['bass', 'alto', 'tenor', 'soprano'],
    allowNull: true,
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
    timestamps:true
  });

module.exports= choirMember