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
    const validAttendances = [];
    const absentUpdates = [];

    const currentDate = new Date();

    for (const entry of data) {
      const { attendanceType, ChoirMemberId, attendanceStatus } = entry;

      const member = await choirMember.findByPk(ChoirMemberId);

      if (!member) {
        logger.warn(`Choir member with ID ${ChoirMemberId} not found.`);
        continue;
      }

      if (!member.isAuthorized) {
        logger.warn(`Choir member with ID ${ChoirMemberId} is not authorized.`);
        continue;
      }

      const attendanceData = {
        attendanceType,
        ChoirMemberId,
        attendanceDate: currentDate,
        attendanceStatus,
      };

      if (attendanceStatus === "present") {
        validAttendances.push(attendanceData);
      } else if (attendanceStatus === "absent") {
        validAttendances.push(attendanceData);

        const absentData = {
          choirMemberFirstName: member.choirMemberFirstName,
          choirMemberLastName: member.choirMemberLastName,
          choirMemberGender: member.choirMemberGender,
          choirMemberPhoneNumber: member.choirMemberPhoneNumber,
          attendanceType,
          attendanceDate: currentDate,
          attendanceStatus,
          churchAbsentRate: member.churchAbsentRate,
          repetitionAbsentRate: member.repetitionAbsentRate,
          weddingAbsentRate: member.weddingAbsentRate,
          deathAbsentRate: member.deathAbsentRate,
        };

        await AbsentChoirMember.create(absentData);

        switch (attendanceType) {
          case "church":
            member.churchAbsentRate++;
            break;
          case "repetition":
            member.repetitionAbsentRate++;
            break;
          case "wedding":
            member.weddingAbsentRate++;
            break;
          case "death":
            member.deathAbsentRate++;
            break;
        }
        await member.save();
        absentUpdates.push(member);
      } else {
        logger.warn(
          `Invalid attendance status for ChoirMemberId ${ChoirMemberId}: ${attendanceStatus}`
        );
        continue;
      }
    }

    if (validAttendances.length > 0) {
      await AttendanceModel.bulkCreate(validAttendances);
    }

    res.status(200).json({ message: "Attendance marked successfully" });

    absentUpdates.forEach((member) => {
      monitorAttendance(io, member);
      regularAttendanceCheck(io, member.id);
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Server error, try again later" });
  }
};



exports.getAttendanceStatistics = async (req, res) => {
  try {
    // Step 1: Fetch all attendance records
    const attendanceRecords = await AttendanceModel.findAll();

    console.log("here are data",attendanceRecords);

    const attendanceStatistics = {
      church: [],
      wedding: [],
      repetition: [],
      death: [],
    };

    let totalPresent = 0;
    let totalAttendances = 0;

    // Step 2: Group and process data
    attendanceRecords.forEach((record) => {
      const { attendanceType, attendanceDate, attendanceStatus } = record;

      const month = new Date(attendanceDate).getMonth() + 1;

      if (!attendanceStatistics[attendanceType]) {
        console.warn(`Unknown attendance type: ${attendanceType}`);
        return;
      }

      // Check if data for the current month exists, otherwise initialize
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

      // Increment counts
      monthlyData.totalCount += 1;
      if (attendanceStatus === "present") {
        monthlyData.presentCount += 1;
      }

      totalPresent += attendanceStatus === "present" ? 1 : 0;
      totalAttendances += 1;
    });

    // Step 3: Calculate percentages
    Object.values(attendanceStatistics).forEach((typeStatistics) => {
      typeStatistics.forEach((entry) => {
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

    const totalChoirMembers = await choirMember.count();

    // Step 4: Return response
    res.status(200).json({
      attendanceStatistics,
      overallAttendancePercentage,
      totalChoirMembers,
    });
  } catch (error) {
    console.error("Error retrieving attendance statistics:", error);
    res.status(500).json({ error: "Server error, try again later" });
  }
};
