const Announcement = require("../models/announcements");
const ChoirMember = require("../models/choirMember");
const emailService = require("../utils/emailService");
const logger = require("../utils/logger");

exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  if (title.length > 200) {
    return res.status(400).json({ error: "Title must be 200 characters or less" });
  }

  try {
    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      choirMemberId: req.user.userId || req.user.adminId || 0,
      dateSent: new Date()
    });

    const members = await ChoirMember.findAll({ 
      where: { status: 'active' },
      attributes: ['email', 'choirMemberFirstName']
    });

    const validEmails = members.filter(m => m.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email));
    
    if (validEmails.length === 0) {
      logger.warn("No valid email addresses found for announcement");
      return res.status(200).json({ 
        message: "Announcement created but no members to notify",
        announcement,
        emailsSent: 0
      });
    }

    const emailPromises = validEmails.map(member => 
      emailService.sendAnnouncement(member.email, title, message)
        .catch(err => {
          logger.error(`Failed to send announcement to ${member.email}:`, err);
          return null;
        })
    );

    await Promise.allSettled(emailPromises);

    logger.info(`Announcement sent to ${validEmails.length} members`);
    res.status(201).json({ 
      message: "Announcement sent successfully", 
      emailsSent: validEmails.length,
      announcement
    });
  } catch (error) {
    logger.error("Error sending announcement:", error);
    res.status(500).json({ 
      error: "Failed to send announcement",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const announcements = await Announcement.findAll({ 
      order: [['dateSent', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Announcement.count();

    res.status(200).json({ 
      announcements,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error("Error fetching announcements:", error);
    res.status(500).json({ 
      error: "Failed to fetch announcements",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteAllAnnouncements = async (req, res) => {
  try {
    const deletedCount = await Announcement.destroy({ where: {} });

    logger.info(`All announcements deleted: ${deletedCount} records`);
    res.status(200).json({ 
      message: "All announcements deleted successfully",
      deletedCount
    });
  } catch (error) {
    logger.error("Error deleting all announcements:", error);
    res.status(500).json({ 
      error: "Failed to delete announcements",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
