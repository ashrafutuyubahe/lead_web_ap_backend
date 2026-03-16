const choirMember = require("../models/choirMember");
const logger = require("../utils/logger");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const { VALID_VOICE_TYPES } = require("../utils/constants");

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
    role,
    voiceType,
  } = req.body;

  if (
    !choirMemberFirstName?.trim() ||
    !choirMemberLastName?.trim() ||
    !choirMemberGender?.trim() ||
    !choirMemberPhoneNumber ||
    !email.trim() ||
    !voiceType?.trim()
  ) {
    return res.status(400).json({
      error:
        "First name, last name, gender, phone number, email, and voice type are required",
    });
  }

  if (!VALID_VOICE_TYPES.includes(voiceType.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid voice type. Must be one of: ${VALID_VOICE_TYPES.join(", ")}`,
    });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validatePhoneNumberMember(choirMemberPhoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const existingMember = await choirMember.findOne({
      where: {
        [Op.or]: [
          { choirMemberPhoneNumber: String(choirMemberPhoneNumber) },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingMember) {
      return res.status(409).json({
        error: "Member already exists with this phone number or email",
      });
    }

    const newMember = await choirMember.create({
      choirMemberFirstName: choirMemberFirstName.trim(),
      choirMemberLastName: choirMemberLastName.trim(),
      choirMemberGender: choirMemberGender.trim(),
      choirMemberPhoneNumber: String(choirMemberPhoneNumber),
      email: email?.trim() || null,
      role: role || "member",
      voiceType: voiceType.toLowerCase(),
    });

    logger.info(`Member added: ${newMember.choirMemberId}`);
    res.status(201).json({
      message: "Member added successfully",
      member: newMember,
    });
  } catch (error) {
    logger.error("Error adding member:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Member with this information already exists",
      });
    }

    res.status(500).json({
      error: "Failed to add member",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const allMembers = await choirMember.findAll({
      order: [
        ["choirMemberLastName", "ASC"],
        ["choirMemberFirstName", "ASC"],
      ],
    });

    res.status(200).json({
      members: allMembers,
      totalMemberNumber: allMembers.length,
    });
  } catch (error) {
    logger.error("Error retrieving members:", error);
    res.status(500).json({
      error: "Failed to retrieve members",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

function validatePhoneNumber(phone) {
  return /^\d{9}$/.test(phone);
}

function validatePhoneNumberMember(phone) {
  return /^\d{10}$/.test(phone);
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
      const phoneNumber = row.getCell(4).value?.toString().replace(/\D/g, "");
      const emailValue = row.getCell(5).value;
      const email =
        emailValue && typeof emailValue === "object"
          ? emailValue.text?.trim()
          : emailValue?.toString().trim();
      const voiceCell = row.getCell(6).value;
      const voiceType = voiceCell?.toString().trim().toLowerCase();
      const role = row.getCell(7).value?.toString().trim() || "member";

      if (!firstName || !lastName || !email) {
        errors.push({
          row: rowNumber,
          error: "Missing first or last name or email",
        });
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

      if (!voiceType || !VALID_VOICE_TYPES.includes(voiceType)) {
        errors.push({
          row: rowNumber,
          error: `Invalid or missing voice type. Expected one of: ${VALID_VOICE_TYPES.join(", ")}`,
        });
        return;
      }

      membersToCreate.push({
        choirMemberFirstName: firstName,
        choirMemberLastName: lastName,
        choirMemberGender: gender || "Not Specified",
        choirMemberPhoneNumber: phoneNumber,
        email: email || null,
        role: role,
        voiceType,
        rowNumber,
      });
    });

    const created = [];

    for (const memberData of membersToCreate) {
      const { rowNumber, ...data } = memberData;

      const whereClause = {
        [Op.or]: [
          { choirMemberPhoneNumber: data.choirMemberPhoneNumber },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      };

      const existingMember = await choirMember.findOne({ where: whereClause });

      if (existingMember) {
        duplicates.push({
          row: rowNumber,
          name: `${data.choirMemberFirstName} ${data.choirMemberLastName}`,
          reason: "Phone or email already exists",
        });
      } else {
        try {
          await choirMember.create(data);
          created.push(rowNumber);
        } catch (error) {
          errors.push({
            row: rowNumber,
            error: error.message,
          });
        }
      }
    }

    logger.info(
      `Bulk upload: ${created.length} created, ${duplicates.length} duplicates, ${errors.length} errors`,
    );

    res.status(200).json({
      message: `Successfully processed ${created.length} members`,
      summary: {
        created: created.length,
        duplicates: duplicates.length,
        errors: errors.length,
      },
      details: {
        ...(duplicates.length > 0 && { duplicates }),
        ...(errors.length > 0 && { errors }),
      },
    });
  } catch (error) {
    logger.error("Error processing file:", error);
    res.status(500).json({
      error: "Failed to process file",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.updateMember = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    gender,
    phoneNumber,
    email,
    role,
    status,
    voiceType,
  } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid member ID is required" });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (voiceType && !VALID_VOICE_TYPES.includes(voiceType.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid voice type. Must be one of: ${VALID_VOICE_TYPES.join(", ")}`,
    });
  }

  if (phoneNumber && !validatePhoneNumberMember(phoneNumber)) {
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
          ...(phoneNumber
            ? [{ choirMemberPhoneNumber: String(phoneNumber) }]
            : []),
          ...(email ? [{ email }] : []),
        ],
      };

      const duplicate = await choirMember.findOne({ where: whereClause });

      if (duplicate) {
        return res.status(409).json({
          error: "Another member already has this phone number or email",
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
    if (voiceType) updateData.voiceType = voiceType.toLowerCase();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    await member.update(updateData);

    logger.info(`Member updated: ${id}`);
    res.status(200).json({
      message: "Member updated successfully",
      member,
    });
  } catch (error) {
    logger.error("Error updating member:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Member with this information already exists",
      });
    }

    res.status(500).json({
      error: "Failed to update member",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
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
      where: { choirMemberId: id },
    });

    const announcementCount = await Announcement.destroy({
      where: { choirMemberId: id },
    });

    await member.destroy();

    logger.info(
      `Member deleted: ${id} (${attendanceCount} attendance records, ${announcementCount} announcements removed)`,
    );
    res.status(200).json({
      message: "Member deleted successfully",
      relationsRemoved: {
        attendance: attendanceCount,
        announcements: announcementCount,
      },
    });
  } catch (error) {
    logger.error("Error deleting member:", error);
    res.status(500).json({
      error: "Failed to delete member",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.downloadMembersReport = async (req, res) => {
  try {
    const members = await choirMember.findAll({
      where: { status: "active" },
      order: [
        ["choirMemberLastName", "ASC"],
        ["choirMemberFirstName", "ASC"],
      ],
    });

    if (members.length === 0) {
      return res.status(404).json({ error: "No active members found" });
    }

    const csvRows = [];
    csvRows.push(
      "ID,First Name,Last Name,Gender,Phone,Email,Voice Type,Role,Status",
    );

    members.forEach((m) => {
      csvRows.push(
        `"${m.choirMemberId}","${m.choirMemberFirstName}","${m.choirMemberLastName}","${m.choirMemberGender}","${m.choirMemberPhoneNumber}","${m.email || ""}","${m.voiceType || ""}","${m.role || ""}","${m.status || ""}"`,
      );
    });

    const csv = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="members-report-${new Date().toISOString().split("T")[0]}.csv"`,
    );
    res.status(200).send(csv);
  } catch (error) {
    logger.error("Error downloading members report:", error);
    res.status(500).json({ error: "Failed to generate members report" });
  }
};

exports.downloadUploadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Members Template");

    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 18 },
      { header: "Last Name", key: "lastName", width: 18 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Phone Number", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 28 },
      { header: "Voice Type", key: "voiceType", width: 14 },
      { header: "Role", key: "role", width: 14 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    headerRow.alignment = { horizontal: "center" };

    // Add dummy data rows
    const sampleData = [
      {
        firstName: "Jean",
        lastName: "Mugisha",
        gender: "Male",
        phone: "250788001",
        email: "jean.mugisha@example.com",
        voiceType: "bass",
        role: "member",
      },
      {
        firstName: "Marie",
        lastName: "Uwimana",
        gender: "Female",
        phone: "250788002",
        email: "marie.uwimana@example.com",
        voiceType: "soprano",
        role: "member",
      },
      {
        firstName: "Patrick",
        lastName: "Habimana",
        gender: "Male",
        phone: "250788003",
        email: "patrick.h@example.com",
        voiceType: "tenor",
        role: "member",
      },
      {
        firstName: "Grace",
        lastName: "Mukamana",
        gender: "Female",
        phone: "250788004",
        email: "grace.m@example.com",
        voiceType: "alto",
        role: "member",
      },
      {
        firstName: "Emmanuel",
        lastName: "Niyonzima",
        gender: "Male",
        phone: "250788005",
        email: "emmanuel.n@example.com",
        voiceType: "bass",
        role: "attendance_taker",
      },
    ];

    sampleData.forEach((row) => {
      const dataRow = worksheet.addRow(row);
      dataRow.font = { color: { argb: "FF6B7280" }, italic: true };
    });

    // Add voice type dropdown validation for column F (Voice Type)
    for (let i = 2; i <= 200; i++) {
      worksheet.getCell(`F${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"bass,alto,tenor,soprano"'],
        showErrorMessage: true,
        errorTitle: "Invalid Voice Type",
        error: "Must be one of: bass, alto, tenor, soprano",
      };
      worksheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"Male,Female"'],
        showErrorMessage: true,
        errorTitle: "Invalid Gender",
        error: "Must be Male or Female",
      };
      worksheet.getCell(`G${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"member,attendance_taker"'],
        showErrorMessage: true,
        errorTitle: "Invalid Role",
        error: "Must be member or attendance_taker",
      };
    }

    // Add an instructions sheet
    const infoSheet = workbook.addWorksheet("Instructions");
    infoSheet.getColumn(1).width = 20;
    infoSheet.getColumn(2).width = 50;

    const infoHeaderRow = infoSheet.addRow(["Column", "Description"]);
    infoHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    infoHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    const instructions = [
      ["First Name", "Required. Member's first name"],
      ["Last Name", "Required. Member's last name"],
      ["Gender", "Required. Male or Female"],
      ["Phone Number", "Required. 9-digit number (no country code prefix)"],
      ["Email", "Required. Valid email address"],
      ["Voice Type", "Required. One of: bass, alto, tenor, soprano"],
      [
        "Role",
        'Optional. Defaults to "member". Can be: member, attendance_taker',
      ],
    ];
    instructions.forEach((row) => infoSheet.addRow(row));

    infoSheet.addRow([]);
    const noteRow = infoSheet.addRow([
      "NOTE",
      "Delete the sample data rows before uploading. Keep the header row.",
    ]);
    noteRow.font = { bold: true, color: { argb: "FFDC2626" } };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="choir-members-template.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error("Error generating template:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
};
