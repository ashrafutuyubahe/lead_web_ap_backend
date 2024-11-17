
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const choirMember = require("./choirMember");

const AttendanceModel = sequelize.define("Attendance", {
  attendanceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  attendanceType: {
    type: DataTypes.ENUM,
    values: ["church", "wedding", "Repetition", "Death"],
    allowNull: false,
  },
  attendanceStatus: {
    type: DataTypes.ENUM,
    values: ["present", "absent", "authorized"],
    allowNull: false,
  },
  attendanceDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  choirMemberId: {
    type: DataTypes.INTEGER,
    references: {
      model: choirMember,
      key: "choirMemberId",
    },
  },
}, { timestamps: true });

module.exports = AttendanceModel;

