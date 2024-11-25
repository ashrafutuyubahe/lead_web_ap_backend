const choirMember = require("../models/choirMember");
const AttendanceModel = require("../models/attendenceModel");
const AbsentChoirMember = require("../models/absentChoirMemberModel");
const logger = require("../utils/logger");
const { Op, Sequelize } = require("sequelize");
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

      if (attendanceStatus === 'present') {
        validAttendances.push(attendanceData);
      } else if (attendanceStatus === 'absent') {
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
          case 'church':
            member.churchAbsentRate++;
            break;
          case 'repetition':
            member.repetitionAbsentRate++;
            break;
          case 'wedding':
            member.weddingAbsentRate++;
            break;
          case 'death':
            member.deathAbsentRate++;
            break;
        }
        await member.save();
        absentUpdates.push(member);
      } else {
        logger.warn(`Invalid attendance status for ChoirMemberId ${ChoirMemberId}: ${attendanceStatus}`);
        continue;
      }
    }

    if (validAttendances.length > 0) {
      await AttendanceModel.bulkCreate(validAttendances);
    }

    res.status(200).json({ message: 'Attendance marked successfully' });

    absentUpdates.forEach((member) => {
      monitorAttendance(io, member);
      regularAttendanceCheck(io, member.id); 
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: 'Server error, try again later' });
  }
};


exports.getAttendanceStatistics = async (req, res) => {
  try {
    const totalChoirMembers = await choirMember.count();

    // Use raw query to get attendance statistics
    const attendanceData = await Sequelize.query(
      `SELECT "attendanceType", 
              EXTRACT(MONTH FROM "attendanceDate") AS "month", 
              SUM(CASE WHEN "attendanceStatus" = 'present' THEN 1 ELSE 0 END) AS "presentCount", 
              COUNT("attendanceStatus") AS "totalCount" 
       FROM "Attendances" 
       GROUP BY "attendanceType", EXTRACT(MONTH FROM "attendanceDate");`,
      { type: QueryTypes.SELECT }
    );

    const attendanceStatistics = {};
    let totalPresent = 0;
    let totalAttendances = 0;

    attendanceData.forEach((entry) => {
      const { attendanceType, month, presentCount, totalCount } = entry;
      const attendancePercentage = ((presentCount / totalCount) * 100).toFixed(2);

      if (!attendanceStatistics[attendanceType]) {
        attendanceStatistics[attendanceType] = [];
      }

      attendanceStatistics[attendanceType].push({
        month: parseInt(month),
        attendancePercentage,
      });

      totalPresent += parseInt(presentCount);
      totalAttendances += parseInt(totalCount);
    });

    const overallAttendancePercentage = ((totalPresent / totalAttendances) * 100).toFixed(2);

    res.status(200).json({
      totalChoirMembers,
      attendanceStatistics,
      overallAttendancePercentage,
    });
  } catch (error) {
    console.log(error);
    logger.error("Error retrieving attendance statistics:", error);
    res.status(500).json({ error: "Server error, try again later" });
  }
};