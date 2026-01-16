const Announcement = require("../models/announcements");
const ChoirMember = require("../models/choirMember");
const emailService = require("../utils/emailService");
const logger = require("../utils/logger");

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    
    // Create record
    const announcement = await Announcement.create({
      title,
      message,
      choirMemberId: req.user.userId || req.user.adminId || 0, // Track who sent it
      dateSent: new Date()
    });

    // Send emails
    const members = await ChoirMember.findAll({ where: { status: 'active' } });
    const emails = members.map(m => m.email).filter(e => e); // Filter valid emails

    // This could be slow if many members, consider queueing in production
    for (const email of emails) {
        await emailService.sendAnnouncement(email, title, message);
    }

    res.status(201).json({ message: "Announcement sent successfully.", count: emails.length });
  } catch (error) {
    logger.error("Error sending announcement:", error);
    res.status(500).json({ error: "Server error." });
  }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.findAll({ order: [['dateSent', 'DESC']] });
        res.status(200).json({ announcements });
    } catch (error) {
        res.status(500).json({ error: "Server error." });
    }
};
