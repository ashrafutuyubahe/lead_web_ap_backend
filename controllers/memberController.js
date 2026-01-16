const nodemailer = require('nodemailer');
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
    email,
    role
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
      email: email || null,
      role: role || 'member'
    });
    logger.info(
      `New choir member added: ${choirMemberFirstName} ${choirMemberLastName}`
    );
    res
      .status(201)
      .json({ message: "Choir member added successfully", member: newMember });
  } catch (error) {
    logger.error("Error adding choir member:", error);
    res.status(500).json({ error: "Failed to add choir member: " + error.message });
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




const sendMsg= (choirMemberEmail)=>{



const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: true, 
  auth: {
    user: ADMIN_EMAIL, 
    pass: ADMIN_EMAIL_PASSWORD,  
  },
});


const mailOptions = {
  from: process.env.ADMIN_EMAIL,
  to: choirMemberEmail,
  subject: 'Hello!',
  text: 'This is a test email from Nodemailer.',
};


transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Email sent:', info.response);
  }
});


}

exports.uploadChoirMembers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    const membersToCreate = [];
    const redundantMembers = [];
    
    // Assuming columns: 1: FirstName, 2: LastName, 3: Gender, 4: PhoneNumber, 5: Email (opt), 6: Role (opt)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const firstName = row.getCell(1).value;
      const lastName = row.getCell(2).value;
      const gender = row.getCell(3).value;
      let phoneNumber = row.getCell(4).value;
      const email = row.getCell(5).value; // Optional
      const role = row.getCell(6).value || 'member'; // Optional, default member

      // Basic validation
      if (!firstName || !lastName) return;

      // Clean phone number (convert to string if number)
      if (phoneNumber) phoneNumber = String(phoneNumber);

      membersToCreate.push({
        choirMemberFirstName: firstName,
        choirMemberLastName: lastName,
        choirMemberGender: gender || 'Not Specified',
        choirMemberPhoneNumber: phoneNumber || '0000000000',
        email: email && typeof email === 'object' ? email.text : email, // Handler for hyperlink cells
        role: role
      });
    });

    const savePromises = [];

    for (const memberData of membersToCreate) {
       // Check for duplicates based on PhoneNumber (unique in model) or Email
       const whereClause = {};
       if (memberData.choirMemberPhoneNumber && memberData.choirMemberPhoneNumber !== '0000000000') {
           whereClause.choirMemberPhoneNumber = memberData.choirMemberPhoneNumber;
       } else if (memberData.email) {
           whereClause.email = memberData.email;
       } else {
           // Skip if no unique identifier
           continue; 
       }

      const existingMember = await choirMember.findOne({ where: whereClause });

      if (existingMember) {
        redundantMembers.push(memberData);
      } else {
        savePromises.push(choirMember.create(memberData));
      }
    }

    await Promise.all(savePromises);

    let responseMessage = `Successfully processed ${savePromises.length} members.`;
    if (redundantMembers.length > 0) {
      responseMessage += ` ${redundantMembers.length} members were skipped as they already exist.`;
    }

    return res.status(200).json({
      message: responseMessage,
      redundantMembers,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file: " + error.message });
  }
};

exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, gender, phoneNumber, email, role, status } = req.body;
        
        const member = await choirMember.findByPk(id);
        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        // Prepare update object
        const updateData = {};
        if (firstName) updateData.choirMemberFirstName = firstName;
        if (lastName) updateData.choirMemberLastName = lastName;
        if (gender) updateData.choirMemberGender = gender;
        if (phoneNumber) updateData.choirMemberPhoneNumber = phoneNumber;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        await member.update(updateData);
        
        res.status(200).json({ message: "Member updated successfully", member });
    } catch (error) {
        logger.error("Error updating member:", error);
        res.status(500).json({ error: "Failed to update member" });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await choirMember.findByPk(id);
        
        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        await member.destroy();
        res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
        logger.error("Error deleting member:", error);
        res.status(500).json({ error: "Failed to delete member" });
    }
};
