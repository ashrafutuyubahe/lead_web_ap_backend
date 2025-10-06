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
  }},{
    timestamps:true
  });


  module.exports= choirMember



  