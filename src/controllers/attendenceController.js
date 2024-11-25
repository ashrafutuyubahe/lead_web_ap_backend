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
    // SQL query to get the attendance statistics, grouped by attendance type and month
    const attendanceData =await AttendanceModel.sequelize.query(
      `SELECT "attendanceType", 
              EXTRACT(MONTH FROM "attendanceDate") AS "month", 
              SUM(CASE WHEN "attendanceStatus" = 'present' THEN 1 ELSE 0 END) AS "presentCount", 
              COUNT("attendanceStatus") AS "totalCount" 
       FROM "Attendances" 
       GROUP BY "attendanceType", EXTRACT(MONTH FROM "attendanceDate")`,
      { type: QueryTypes.SELECT }
    );

    const attendanceStatistics = {
      church: [],
      wedding: [],
      repetition: [],
      death: [],
    };

    let totalPresent = 0;
    let totalAttendances = 0;

    // Process the data to format it for graphing
    attendanceData.forEach((entry) => {
      const { attendanceType, month, presentCount, totalCount } = entry;

      const attendancePercentage = ((presentCount / totalCount) * 100).toFixed(2);

      // Format the data to be used for graphing
      if (attendanceStatistics[attendanceType]) {
        attendanceStatistics[attendanceType].push({
          month: parseInt(month),
          presentCount: parseInt(presentCount),
          totalCount: parseInt(totalCount),
          attendancePercentage,
        });
      }

      totalPresent += parseInt(presentCount);
      totalAttendances += parseInt(totalCount);
    });

    // Calculate overall attendance percentage
    const overallAttendancePercentage = (
      (totalPresent / totalAttendances) *
      100
    ).toFixed(2);

    // Response in a graph-friendly format
    res.status(200).json({
      attendanceStatistics,
      overallAttendancePercentage,
      totalChoirMembers: await choirMember.count(),
    });
  } catch (error) {
    console.log(error);
    logger.error("Error retrieving attendance statistics:", error);
    res.status(500).json({ error: "Server error, try again later" });
  }
};
