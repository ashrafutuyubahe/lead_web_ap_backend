const sequelize = require("../config/db");
const choirMember = require("./choirMember");
const AttendanceModel = require("./attendenceModel");

// Define associations
choirMember.hasMany(AttendanceModel, { foreignKey: 'choirMemberId', as: 'Attendances' });
AttendanceModel.belongsTo(choirMember, { foreignKey: 'choirMemberId', as: 'ChoirMember' });

module.exports = {
  sequelize,
  choirMember,
  AttendanceModel
};
