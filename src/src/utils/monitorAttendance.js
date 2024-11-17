module.exports = async function sendPunishmentMessage(io, member, attendanceType) {
  const PUNISHMENT_THRESHOLDS = {
    repetition: 8,
    church: 4,
    wedding: 4,
    death: 4,
  };

  const absenceRate = member[`${attendanceType}`];

  if (absenceRate >= PUNISHMENT_THRESHOLDS[attendanceType]) {
    const punishmentMessage = `Dear ${member.choirMemberFirstName} ${member.choirMemberLastName}, You have been suspended due to excessive absences in ${attendanceType}. Please contact the choir administration and pay the punishment fees.`;

    io.emit('attendance:punishment', {
      message: punishmentMessage,
      choirMemberId: member.id,
      phoneNumber: member.choirMemberPhoneNumber,
    });

    await sendSMS(member.choirMemberPhoneNumber, punishmentMessage);
  }
};
