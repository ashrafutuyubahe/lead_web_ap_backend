const choirMember = require("../models/choirMember");
const logger = require("../utils/logger");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};



exports.addMember = async (req, res) => {
  const {
    choirMemberFirstName,
    choirMemberLastName,
    choirMemberGender,
    choirMemberPhoneNumber,
    email,
    role
  } = req.body;

  if (!choirMemberFirstName?.trim() || !choirMemberLastName?.trim() || 
      !choirMemberGender?.trim() || !choirMemberPhoneNumber || !email.trim()) {
    return res.status(400).json({
      error: "First name, last name, gender, phone number, and email are required"
    });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validatePhoneNumber(choirMemberPhoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const existingMember = await choirMember.findOne({
      where: {
        [Op.or]: [
          { choirMemberPhoneNumber: String(choirMemberPhoneNumber) },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingMember) {
      return res.status(409).json({
        error: "Member already exists with this phone number or email"
      });
    }

    const newMember = await choirMember.create({
      choirMemberFirstName: choirMemberFirstName.trim(),
      choirMemberLastName: choirMemberLastName.trim(),
      choirMemberGender: choirMemberGender.trim(),
      choirMemberPhoneNumber: String(choirMemberPhoneNumber),
      email: email?.trim() || null,
      role: role || 'member'
    });

    logger.info(`Member added: ${newMember.choirMemberId}`);
    res.status(201).json({ 
      message: "Member added successfully", 
      member: newMember 
    });
  } catch (error) {
    logger.error("Error adding member:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: "Member with this information already exists" 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to add member",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const allMembers = await choirMember.findAll({
      order: [['choirMemberLastName', 'ASC'], ['choirMemberFirstName', 'ASC']]
    });

    res.status(200).json({ 
      members: allMembers, 
      totalMemberNumber: allMembers.length 
    });
  } catch (error) {
    logger.error("Error retrieving members:", error);
    res.status(500).json({ 
      error: "Failed to retrieve members",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

function validatePhoneNumber(phone) {
 
  return /^\d{9}$/.test(phone);
}


exports.uploadChoirMembers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
      return res.status(400).json({ error: "Invalid Excel file format" });
    }

    const membersToCreate = [];
    const errors = [];
    const duplicates = [];
    let rowNumber = 0;

    worksheet.eachRow((row, index) => {
      if (index === 1) return;
      rowNumber = index;

      const firstName = row.getCell(1).value?.toString().trim();
      const lastName = row.getCell(2).value?.toString().trim();
      const gender = row.getCell(3).value?.toString().trim();
      const phoneNumber = row.getCell(4).value?.toString().replace(/\D/g, '');
      const emailValue = row.getCell(5).value;
      const email = emailValue && typeof emailValue === 'object' 
        ? emailValue.text?.trim() 
        : emailValue?.toString().trim();
      const role = row.getCell(6).value?.toString().trim() || 'member';

      if (!firstName || !lastName || !email) {
        errors.push({ row: rowNumber, error: "Missing first or last name or email" });
        return;
      }

      if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
        errors.push({ row: rowNumber, error: "Invalid phone number" });
        return;
      }

      if (email && !validateEmail(email)) {
        errors.push({ row: rowNumber, error: "Invalid email format" });
        return;
      }

      membersToCreate.push({
        choirMemberFirstName: firstName,
        choirMemberLastName: lastName,
        choirMemberGender: gender || 'Not Specified',
        choirMemberPhoneNumber: phoneNumber,
        email: email || null,
        role: role,
        rowNumber
      });
    });

    const created = [];
    
    for (const memberData of membersToCreate) {
      const { rowNumber, ...data } = memberData;
      
      const whereClause = {
        [Op.or]: [
          { choirMemberPhoneNumber: data.choirMemberPhoneNumber },
          ...(data.email ? [{ email: data.email }] : [])
        ]
      };

      const existingMember = await choirMember.findOne({ where: whereClause });

      if (existingMember) {
        duplicates.push({ 
          row: rowNumber, 
          name: `${data.choirMemberFirstName} ${data.choirMemberLastName}`,
          reason: "Phone or email already exists"
        });
      } else {
        try {
          await choirMember.create(data);
          created.push(rowNumber);
        } catch (error) {
          errors.push({ 
            row: rowNumber, 
            error: error.message 
          });
        }
      }
    }

    logger.info(`Bulk upload: ${created.length} created, ${duplicates.length} duplicates, ${errors.length} errors`);

    res.status(200).json({
      message: `Successfully processed ${created.length} members`,
      summary: {
        created: created.length,
        duplicates: duplicates.length,
        errors: errors.length
      },
      details: {
        ...(duplicates.length > 0 && { duplicates }),
        ...(errors.length > 0 && { errors })
      }
    });
  } catch (error) {
    logger.error("Error processing file:", error);
    res.status(500).json({ 
      error: "Failed to process file",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateMember = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, gender, phoneNumber, email, role, status } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid member ID is required" });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const member = await choirMember.findByPk(id);
    
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (phoneNumber || email) {
      const whereClause = {
        choirMemberId: { [Op.ne]: id },
        [Op.or]: [
          ...(phoneNumber ? [{ choirMemberPhoneNumber: String(phoneNumber) }] : []),
          ...(email ? [{ email }] : [])
        ]
      };

      const duplicate = await choirMember.findOne({ where: whereClause });
      
      if (duplicate) {
        return res.status(409).json({ 
          error: "Another member already has this phone number or email" 
        });
      }
    }

    const updateData = {};
    if (firstName?.trim()) updateData.choirMemberFirstName = firstName.trim();
    if (lastName?.trim()) updateData.choirMemberLastName = lastName.trim();
    if (gender?.trim()) updateData.choirMemberGender = gender.trim();
    if (phoneNumber) updateData.choirMemberPhoneNumber = String(phoneNumber);
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    await member.update(updateData);
    
    logger.info(`Member updated: ${id}`);
    res.status(200).json({ 
      message: "Member updated successfully", 
      member 
    });
  } catch (error) {
    logger.error("Error updating member:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: "Member with this information already exists" 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to update member",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteMember = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid member ID is required" });
  }

  try {
    const member = await choirMember.findByPk(id);
    
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const AttendanceModel = require("../models/attendenceModel");
    const Announcement = require("../models/announcements");

    const attendanceCount = await AttendanceModel.destroy({
      where: { choirMemberId: id }
    });

    const announcementCount = await Announcement.destroy({
      where: { choirMemberId: id }
    });

    await member.destroy();
    
    logger.info(`Member deleted: ${id} (${attendanceCount} attendance records, ${announcementCount} announcements removed)`);
    res.status(200).json({ 
      message: "Member deleted successfully",
      relationsRemoved: {
        attendance: attendanceCount,
        announcements: announcementCount
      }
    });
  } catch (error) {
    logger.error("Error deleting member:", error);
    res.status(500).json({ 
      error: "Failed to delete member",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
