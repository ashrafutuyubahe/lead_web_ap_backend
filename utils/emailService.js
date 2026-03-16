const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.response}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    return false;
  }
};

const sendInvitation = async (email, token, role) => {
  const subject = 'Invitation to Join Choir Manager';

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; 
  const link = `${frontendUrl}/auth/setup?token=${token}`;
  
  const text = `You have been invited to join the Choir Manager system as a ${role}.\n\nPlease click the link below to set your password and activate your account:\n\n${link}\n\nIf you did not expect this invitation, please ignore this email.`;
  await sendEmail(email, subject, text);
};

const sendAnnouncement = async (email, title, message) => {
  const subject = `Announcement: ${title}`;
  await sendEmail(email, subject, message);
};

const sendAttendanceAlert = async (email, type, firstName) => {
  let subject = '';
  let text = '';

  if (type === 'good_job') {
    subject = 'Great Attendance!';
    text = `Hello ${firstName},\n\nWe noticed you have attended the last 2 sessions. Keep up the great work!`;
  } else if (type === 'improve') {
    subject = 'Attendance Notice';
    text = `Hello ${firstName},\n\nWe noticed you have missed the last 2 sessions. Please try to attend upcoming events.`;
  }

  if (subject && text) {
    await sendEmail(email, subject, text);
  }
};

const sendWeeklyAttendanceMessage = async (email, level, fullName) => {
  let subject = 'Raporo y\'icyumweru y\'ubwitabire';
  let text = '';

  if (level === 'high') {
    text = `Dear ${fullName}, Korali Ishema Ryacu iragushimira ubwitabire bwabwe bwiza.Imana iguhe umugisha`;
  } else if (level === 'medium') {
    text = `Dear ${fullName},Korali Ishema Ryacu iragushishikariza kwitabrira ibikorwa iba yateguye murakoze`;
  }

  if (text) {
    await sendEmail(email, subject, text);
  }
};

const sendMonthlyAbsenceWarning = async (email, fullName) => {
  const subject = 'Itangazo ry\'ukwezi ku bwitabire';
  const text = `Dear ${fullName} ,Gusiba kwawe birakabije.Korali Ishema Ryacu irakwibutsa ko ugeze igihe cyo gufatirwa ibihano`;
  await sendEmail(email, subject, text);
};

module.exports = {
  sendEmail,
  sendInvitation,
  sendAnnouncement,
  sendAttendanceAlert,
  sendWeeklyAttendanceMessage,
  sendMonthlyAbsenceWarning,
};
