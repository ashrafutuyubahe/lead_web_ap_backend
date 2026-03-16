const logger = require("./logger");
const {
  sendWeeklyAttendanceEmails,
  sendMonthlyAbsenceWarnings,
} = require("./attendanceSummaryEmails");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const runDailyJobs = async () => {
  const now = new Date();

  try {
    // Run weekly emails on Tuesday (2) so all 4 attendance days (Thu, Sat, Sun, Mon) are captured
    if (now.getDay() === 2) {
      await sendWeeklyAttendanceEmails();
    }

    if (now.getDate() === 1) {
      await sendMonthlyAbsenceWarnings();
    }
  } catch (error) {
    logger.error("Error running attendance summary jobs:", error);
  }
};

const startAttendanceSummaryScheduler = () => {
  runDailyJobs();
  setInterval(runDailyJobs, ONE_DAY_MS);
};

module.exports = {
  startAttendanceSummaryScheduler,
};
