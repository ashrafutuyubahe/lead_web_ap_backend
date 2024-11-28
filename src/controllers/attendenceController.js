const choirMember = require("../models/choirMember");
const AttendanceModel = require("../models/attendenceModel");
const AbsentChoirMember = require("../models/absentChoirMemberModel");
const logger = require("../utils/logger");
const { Op, Sequelize } = require("sequelize");
const { QueryTypes } = require("sequelize");

const regularAttendanceCheck = require("../utils/regularAttendanceCheck");
const io = require("../utils/io");
exports.markAttendance = async (req, res) => {
  const { data } = req.body;

  try {
    const attendances = [];
    const currentDate = new Date();

    for (const entry of data) {
      const { attendanceType, ChoirMemberId, attendanceStatus } = entry;

      const member = await choirMember.findByPk(ChoirMemberId);
      if (!member) {
        logger.warn(`Choir member with ID ${ChoirMemberId} not found.`);
        continue;
      }

     
      try {
        await regularAttendanceCheck(io, ChoirMemberId);
      } catch (checkError) {
        logger.error(
          `Error checking regular attendance for ChoirMemberId ${ChoirMemberId}: ${checkError.message}`
        );
      }

     
      attendances.push({
        attendanceType,
        ChoirMemberId,
        attendanceDate: currentDate,
        attendanceStatus,
      });
    }

    
    if (attendances.length > 0) {
      await AttendanceModel.bulkCreate(attendances);
      res.status(200).json({ message: "Attendance marked successfully." });
    } else {
      res.status(400).json({ message: "No valid attendance data provided." });
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Server error, try again later." });
  }
};





exports.getAttendanceStatistics = async (req, res) => {
  try {

    const attendanceRecords = await AttendanceModel.findAll();
    const choirMembers = await choirMember.findAll();
    
    const attendanceStatistics = {};
    let totalPresent = 0;
    let totalAttendances = 0;

   
    const choirMemberSet = new Set();

   
    attendanceRecords.forEach((record) => {
      const { attendanceType, attendanceDate, attendanceStatus, ChoirMemberId } = record;
      const month = new Date(attendanceDate).getMonth() + 1;

      choirMemberSet.add(ChoirMemberId);

     
      if (!attendanceStatistics[attendanceType]) {
        attendanceStatistics[attendanceType] = [];
      }

     
      let monthlyData = attendanceStatistics[attendanceType].find(
        (entry) => entry.month === month
      );
      if (!monthlyData) {
        monthlyData = {
          month,
          presentCount: 0,
          totalCount: 0,
        };
        attendanceStatistics[attendanceType].push(monthlyData);
      }

   
      monthlyData.totalCount++;
      if (attendanceStatus.toLowerCase() === "present") {
        monthlyData.presentCount++;
      }

    
      if (attendanceStatus.toLowerCase() === "present") {
        totalPresent++;
      }
      totalAttendances++;
    });

   
    Object.values(attendanceStatistics).forEach((typeStats) => {
      typeStats.forEach((entry) => {
        entry.attendancePercentage = (
          (entry.presentCount / entry.totalCount) *
          100
        ).toFixed(2);
      });
    });

    const overallAttendancePercentage =
      totalAttendances > 0
        ? ((totalPresent / totalAttendances) * 100).toFixed(2)
        : "0.00";

    const totalChoirMembers = choirMembers.length;

    res.status(200).json({
      totalChoirMembers,
      overallAttendancePercentage,
      totalAttendances,
      attendanceStatistics,
    });
  } catch (error) {
    console.error("Error retrieving attendance statistics:", error);
    res.status(500).json({ error: "Server error, try again later." });
  }
};



const searchByName= async(req,res)=>{
  
}
