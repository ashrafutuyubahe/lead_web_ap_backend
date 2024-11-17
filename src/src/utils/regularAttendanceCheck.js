



const checkRegularAbesnt= async function regularAttendanceCheck(io, memberId) {
    try {
      const member = await choirMember.findByPk(memberId);
  
      if (!member) {
        logger.warn(`Choir member with ID ${memberId} not found.`);
        return;
      }
  
      
      const WARNING_THRESHOLD = 2;
  
      const attendanceTypes = ['church', 'repetition', 'wedding', 'death'];
  
      let warningMessage = '';
  
      attendanceTypes.forEach((attendanceType) => {
        const absenceRate = member[`${attendanceType}AbsentRate`]; 
  
        if (absenceRate === WARNING_THRESHOLD) {
          warningMessage += `\nYou are near to being blacklisted for missing ${attendanceType} ${absenceRate} times. Please attend this event to avoid penalty.`;
        }
      });
  
      if (warningMessage) {
        warningMessage = `Reminder: ${member.choirMemberFirstName} ${member.choirMemberLastName},` + warningMessage;
        io.emit('attendance:reminder', {
          message: warningMessage,
          choirMemberId: member.id,
          firstName: member.choirMemberFirstName,
          lastName: member.choirMemberLastName,
        });
      }
    } catch (error) {
      console.error('Error checking attendance progress:', error);
    }
  }
  
  module.exports=checkRegularAbesnt;