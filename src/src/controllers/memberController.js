const sequelize = require("../config/db");
const choirMember = require("../models/choirMember");
const logger = require("../utils/logger");
const ExcelJS = require("exceljs");

exports.addMember = async (req, res) => {
  const {
    choirMemberFirstName,
    choirMemberLastName,
    choirMemberGender,
    choirMemberPhoneNumber,
  } = req.body;

  if (
    !choirMemberFirstName ||
    !choirMemberLastName ||
    !choirMemberGender ||
    !choirMemberPhoneNumber
  ) {
    return res.status(400).json({
      error:
        "All fields are required: choirMemberFirstName, choirMemberLastName, choirMemberGender, and choirMemberPhoneNumber.",
    });
  }

  try {
    const newMember = await choirMember.create({
      choirMemberFirstName,
      choirMemberLastName,
      choirMemberGender,
      choirMemberPhoneNumber,
    });
    logger.info(
      `New choir member added: ${choirMemberFirstName} ${choirMemberLastName}`
    );
    res
      .status(201)
      .json({ message: "Choir member added successfully", member: newMember });
  } catch (error) {
    logger.error("Error adding choir member:", error);
    res.status(500).json({ error: "Failed to add choir member." });
  }
};


exports.getAllMembers = async (req, res) => {
  try {
    const allMembers = await choirMember.findAll();
    const totalMemberNumber = allMembers.length;

    if (!allMembers || allMembers.length === 0) {
      return res.status(404).json({ error: "No choir members found." });
    }

    res.status(200).json({ members: allMembers, totalMemberNumber });
  } catch (error) {
    logger.error("Error retrieving choir members:", error);
    res.status(500).json({ error: "Failed to retrieve choir members." });
  }
};




exports.uploadChoirMembers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];

    const jsonData = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const member = {
        memberFirstName: row.getCell(1).value,
        memberLastName: row.getCell(2).value,
        MemberGender: row.getCell(3).value,
        memberPhoneNumber: row.getCell(4).value,
      };
      jsonData.push(member);
    });

    const savePromises = [];
    const redundantMembers = [];

    for (const member of jsonData) {
      const {
        memberFirstName,
        memberLastName,
        MemberGender,
        memberPhoneNumber,
      } = member;

      if (
        !memberFirstName ||
        !memberLastName ||
        !MemberGender ||
        !memberPhoneNumber
      ) {
        continue;
      }

      const existingMember = await choirMember.findOne({
        where: { memberFirstName, memberLastName, memberPhoneNumber },
      });

      if (existingMember) {
        redundantMembers.push(member);
      } else {
        const newMember = choirMember.create({
          memberFirstName,
          memberLastName,
          MemberGender,
          memberPhoneNumber,
        });
        savePromises.push(newMember);
      }
    }

    await Promise.all(savePromises);

    let responseMessage = "Members have been processed successfully.";
    if (redundantMembers.length > 0) {
      responseMessage +=
        " Some members were skipped as they already exist. Please review the file.";
    }

    return res.status(200).json({
      message: responseMessage,
      redundantMembers,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file" });
  }
};
