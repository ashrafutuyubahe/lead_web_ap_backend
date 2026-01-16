const choirMember = require("../models/choirMember");
const AttendanceModel = require("../models/attendenceModel");
const logger = require("../utils/logger");
const { Op, Sequelize } = require("sequelize");
const emailService = require("../utils/emailService");

const VALID_ATTENDANCE_TYPES = ['church', 'wedding', 'Repetition', 'Death'];
const VALID_ATTENDANCE_STATUS = ['present', 'absent'];

exports.markAttendance = async (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Valid attendance data array is required" });
  }

  try {
    const attendances = [];
    const errors = [];
    const currentDate = new Date();

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      let { attendanceType, ChoirMemberId, attendanceStatus } = entry;

      if (!ChoirMemberId || !attendanceType || !attendanceStatus) {
        errors.push({ index: i, error: "Missing required fields" });
        continue;
      }

      attendanceType = attendanceType.toLowerCase() === "repetition" ? "Repetition" :
                       attendanceType.toLowerCase() === "death" ? "Death" : 
                       attendanceType;

      if (!VALID_ATTENDANCE_TYPES.includes(attendanceType)) {
        errors.push({ index: i, error: `Invalid attendance type: ${attendanceType}` });
        continue;
      }

      if (!VALID_ATTENDANCE_STATUS.includes(attendanceStatus.toLowerCase())) {
        errors.push({ index: i, error: `Invalid status: ${attendanceStatus}` });
        continue;
      }

      const member = await choirMember.findByPk(ChoirMemberId);
      if (!member) {
        errors.push({ index: i, memberId: ChoirMemberId, error: "Member not found" });
        continue;
      }

      attendances.push({
        attendanceType,
        ChoirMemberId,
        attendanceDate: currentDate,
        attendanceStatus: attendanceStatus.toLowerCase()
      });
    }

    if (attendances.length === 0) {
      return res.status(400).json({ 
        error: "No valid attendance records to process",
        errors 
      });
    }

    const createdRecords = await AttendanceModel.bulkCreate(attendances);

    const emailErrors = [];
    for (const record of createdRecords) {
      try {
        const member = await choirMember.findByPk(record.ChoirMemberId);
        if (!member?.email) continue;

        const records = await AttendanceModel.findAll({
          where: { 
            ChoirMemberId: record.ChoirMemberId, 
            attendanceType: record.attendanceType 
          },
          order: [['attendanceDate', 'DESC']],
          limit: 2
        });

        if (records.length === 2) {
          const [latest, previous] = records;
          
          if (latest.attendanceStatus === 'present' && previous.attendanceStatus === 'present') {
            await emailService.sendAttendanceAlert(member.email, 'good_job', member.choirMemberFirstName);
          } else if (latest.attendanceStatus === 'absent' && previous.attendanceStatus === 'absent') {
            await emailService.sendAttendanceAlert(member.email, 'improve', member.choirMemberFirstName);
          }
        }
      } catch (emailError) {
        logger.error(`Email alert failed for member ${record.ChoirMemberId}:`, emailError);
        emailErrors.push({ memberId: record.ChoirMemberId, error: "Email notification failed" });
      }
    }

    logger.info(`Attendance marked: ${createdRecords.length} records created`);
    res.status(200).json({ 
      message: "Attendance marked successfully",
      processed: createdRecords.length,
      ...(errors.length > 0 && { errors }),
      ...(emailErrors.length > 0 && { emailErrors })
    });
  } catch (error) {
    logger.error("Error marking attendance:", error);
    res.status(500).json({ 
      error: "Failed to mark attendance",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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









exports.searchByName = async (req, res) => {
  try {
  
    const queryParams = req.query;


    if (!queryParams.firstName && !queryParams.lastName) {
      return res.status(400).json({
        message: "Please provide a first name or last name to search.",
      });
    }

    
    const searchCriteria = {};
    if (queryParams.firstName) {
      searchCriteria.choirMemberFirstName = { [Op.like]: `%${queryParams.firstName}%` };
    }
    if (queryParams.lastName) {
      searchCriteria.choirMemberLastName = { [Op.like]: `%${queryParams.lastName}%` };
    }

   
    const choirMembers = await choirMember.findAll({
      where: searchCriteria,
      attributes: ["choirMemberId", "choirMemberFirstName", "choirMemberLastName"],
    });

    if (choirMembers.length === 0) {
      return res.status(404).json({
        message: "No choir members found matching the search criteria.",
      });
    }

   
    const choirMemberIds = choirMembers.map((member) => member.choirMemberId);

 
    const attendanceRecords = await AttendanceModel.findAll({
      where: {
        choirMemberId: { [Op.in]: choirMemberIds },
      },
      attributes: ["attendanceType", "attendanceDate", "attendanceStatus", "choirMemberId"],
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        message: "No attendance records found for the search criteria.",
      });
    }

   
    const groupedData = attendanceRecords.reduce((acc, record) => {
      const { choirMemberId, attendanceType, attendanceDate, attendanceStatus } = record;
      const member = choirMembers.find((m) => m.choirMemberId === choirMemberId);
      const memberName = `${member.choirMemberFirstName} ${member.choirMemberLastName}`;
      const month = new Date(attendanceDate).getMonth() + 1;

      if (!acc[choirMemberId]) {
        acc[choirMemberId] = {
          memberId: choirMemberId,
          name: memberName,
          attendanceStatistics: {},
          totalPresent: 0,
          totalAttendances: 0,
        };
      }

      const stats = acc[choirMemberId];
      if (!stats.attendanceStatistics[attendanceType]) {
        stats.attendanceStatistics[attendanceType] = {};
      }

      if (!stats.attendanceStatistics[attendanceType][month]) {
        stats.attendanceStatistics[attendanceType][month] = {
          presentCount: 0,
          totalCount: 0,
        };
      }

      const monthlyStats = stats.attendanceStatistics[attendanceType][month];
      monthlyStats.totalCount++;
      stats.totalAttendances++;
      if (attendanceStatus.toLowerCase() === "present") {
        monthlyStats.presentCount++;
        stats.totalPresent++;
      }

      return acc;
    }, {});

   
    const result = Object.values(groupedData).map((member) => {
      const { attendanceStatistics, totalPresent, totalAttendances } = member;

    
      Object.keys(attendanceStatistics).forEach((type) => {
        Object.keys(attendanceStatistics[type]).forEach((month) => {
          const monthStats = attendanceStatistics[type][month];
          monthStats.attendancePercentage = (
            (monthStats.presentCount / monthStats.totalCount) *
            100
          ).toFixed(2);
        });
      });

      member.overallAttendancePercentage =
        ((totalPresent / totalAttendances) * 100).toFixed(2);
      return member;
    });

    res.status(200).json({
      message: "Search results:",
      members: result,
    });
  } catch (error) {
    console.error("Error searching for choir members:", error);
    res.status(500).json({
      message: "Server error, try again later.",
    });
  }
};
