const sendPunishmentMessage= require("./monitorAttendance");

const checkRegularAbesnt = async function regularAttendanceCheck(io, memberId) {
  try {
    const member = await choirMember.findByPk(memberId);

    if (!member) {
      logger.warn(`Choir member with ID ${memberId} not found.`);
      return;
    }

    const WARNING_THRESHOLD = 2;
    const PUNISHMENT_THRESHOLD = 3;

    const attendanceTypes = ['church', 'repetition', 'wedding', 'Death'];
    let warningMessage = '';
    let punishmentTriggered = false;

    attendanceTypes.forEach((attendanceType) => {
      const absenceRate = member[`${attendanceType}AbsentRate`];

      // Warning threshold
      if (absenceRate === WARNING_THRESHOLD) {
        warningMessage += `\nYou are near to being blacklisted for missing ${attendanceType} ${absenceRate} times. Please attend this event to avoid penalty.`;
      }

      // Punishment threshold
      if (absenceRate >= PUNISHMENT_THRESHOLD) {
        sendPunishmentMessage(memberId, attendanceType);
        punishmentTriggered = true;
      }
    });

    // Emit warning message if necessary
    if (warningMessage) {
      warningMessage = `Reminder: ${member.choirMemberFirstName} ${member.choirMemberLastName},` + warningMessage;
      io.emit('attendance:reminder', {
        message: warningMessage,
        choirMemberId: member.id,
        firstName: member.choirMemberFirstName,
        lastName: member.choirMemberLastName,
      });
    }

    if (punishmentTriggered) {
      logger.info(
        `Punishment triggered for ChoirMemberId ${memberId} due to exceeding absence thresholds.`
      );
    }
  } catch (error) {
    console.error('Error checking attendance progress:', error);
  }
};

module.exports = checkRegularAbesnt;
