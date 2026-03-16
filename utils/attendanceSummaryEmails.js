const { Op } = require("sequelize");
const { AttendanceModel, choirMember } = require("../models");
const logger = require("./logger");
const { sendWeeklyAttendanceMessage, sendMonthlyAbsenceWarning } = require("./emailService");

const getDateDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sendWeeklyAttendanceEmails = async () => {
  try {
    const now = new Date();
    const oneWeekAgo = getDateDaysAgo(7);

    const members = await choirMember.findAll({
      where: { status: "active" },
    });

    for (const member of members) {
      if (!member.email) continue;

      const records = await AttendanceModel.findAll({
        where: {
          choirMemberId: member.choirMemberId,
          attendanceDate: {
            [Op.between]: [oneWeekAgo, now],
          },
        },
      });

      if (!records.length) continue;

      const presents = records.filter(
        (r) => r.attendanceStatus?.toLowerCase() === "present"
      ).length;
      const absents = records.filter(
        (r) => r.attendanceStatus?.toLowerCase() === "absent"
      );

      const hasReasonForAbsence = absents.some(
        (r) => r.explanation && r.explanation.toString().trim() !== ""
      );

      if (hasReasonForAbsence) {
        continue;
      }

      if (presents >= 3) {
        await sendWeeklyAttendanceMessage(
          member.email,
          "high",
          `${member.choirMemberFirstName} ${member.choirMemberLastName}`
        );
      } else if (presents >= 1 && presents <= 2) {
        await sendWeeklyAttendanceMessage(
          member.email,
          "medium",
          `${member.choirMemberFirstName} ${member.choirMemberLastName}`
        );
      }
    }

    logger.info("Weekly attendance emails processed.");
  } catch (error) {
    logger.error("Error sending weekly attendance emails:", error);
  }
};

const sendMonthlyAbsenceWarnings = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const members = await choirMember.findAll({
      where: { status: "active" },
    });

    for (const member of members) {
      if (!member.email) continue;

      const records = await AttendanceModel.findAll({
        where: {
          choirMemberId: member.choirMemberId,
          attendanceDate: {
            [Op.gte]: startOfMonth,
          },
        },
      });

      const absencesWithoutReason = records.filter(
        (r) =>
          r.attendanceStatus?.toLowerCase() === "absent" &&
          (!r.explanation || r.explanation.toString().trim() === "")
      ).length;

      if (absencesWithoutReason >= 8) {
        await sendMonthlyAbsenceWarning(
          member.email,
          `${member.choirMemberFirstName} ${member.choirMemberLastName}`
        );
      }
    }

    logger.info("Monthly absence warnings processed.");
  } catch (error) {
    logger.error("Error sending monthly absence warnings:", error);
  }
};

module.exports = {
  sendWeeklyAttendanceEmails,
  sendMonthlyAbsenceWarnings,
};

