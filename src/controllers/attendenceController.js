const choirMember = require("../models/choirMember");
const AttendanceModel = require("../models/attendenceModel");
const AbsentChoirMember = require("../models/absentChoirMemberModel");
const logger = require("../utils/logger");
const { Op, Sequelize } = require("sequelize");
const { QueryTypes } = require("sequelize");
const monitorAttendance = require("../utils/monitorAttendance");
const regularAttendanceCheck = require("../utils/regularAttendanceCheck");
const io = require("../utils/io");

exports.markAttendance = async (req, res) => {
  const { data } = req.body;

  try {
    const attendances = [];
    const currentDate = new Date();

    for (const entry of data) {
      const { attendanceType, ChoirMemberId, attendanceStatus } = entry;

      // Check if the choir member exists
      const member = await choirMember.findByPk(ChoirMemberId);
      if (!member) {
        logger.warn(`Choir member with ID ${ChoirMemberId} not found.`);
        continue;
      }

      

      // Prepare attendance data
      attendances.push({
        attendanceType,
        ChoirMemberId,
        attendanceDate: currentDate,
        attendanceStatus,
      });
    }

    // Bulk insert all attendance records
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
    // Fetch all attendance records
    const attendanceRecords = await AttendanceModel.findAll();

    const attendanceStatistics = {};
    let totalPresent = 0;
    let totalAttendances = 0;

    attendanceRecords.forEach((record) => {
      const { attendanceType, attendanceDate, attendanceStatus } = record;
      const month = new Date(attendanceDate).getMonth() + 1;

      // Initialize statistics for the attendance type if it doesn't exist
      if (!attendanceStatistics[attendanceType]) {
        attendanceStatistics[attendanceType] = [];
      }

      // Find or initialize data for the month
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

      // Update counts
      monthlyData.totalCount++;
      if (attendanceStatus === "present") {
        monthlyData.presentCount++;
      }

      // Update overall counts
      if (attendanceStatus === "present") {
        totalPresent++;
      }
      totalAttendances++;
    });

    // Calculate attendance percentage
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

    res.status(200).json({
      attendanceStatistics,
      overallAttendancePercentage,
      totalAttendances,
    });
  } catch (error) {
    console.error("Error retrieving attendance statistics:", error);
    res.status(500).json({ error: "Server error, try again later." });
  }
};

