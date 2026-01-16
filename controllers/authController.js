const Admin = require("../models/admin");
const ChoirMember = require("../models/choirMember");
const emailService = require("../utils/emailService");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");


exports.registerAdmin = async (req, res) => {
  try {
    const { adminName, adminEmail, adminPassword, adminPhoneNumber } = req.body;

    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ adminEmail }, { adminPhoneNumber }],
      },
    });
    if (existingAdmin) {
      return res
        .status(400)
        .json({
          error: "Admin already exists with this email or phone number",
        });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = await Admin.create({
      adminName,
      adminEmail,
      adminPassword: hashedPassword,
      adminPhoneNumber,
    });

    res.status(201).json({ message: "you have successfully registered" });
  } catch (err) {
    console.log(err);
    logger.error("Error registering admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Try to find an Admin
    // Note: The frontend might send "email" but the Admin model expects "adminEmail"
    // We should check if the user meant adminEmail in the body or just generic email.
    // The request will likely send "email".
    const admin = await Admin.findOne({ where: { adminEmail: email } });
    if (admin) {
        if (await bcrypt.compare(password, admin.adminPassword)) {
            const token = generateJWT(admin, 'admin');
            return res.json({ 
                token,
                user: {
                    id: admin.id,
                    name: admin.adminName,
                    email: admin.adminEmail,
                    role: 'admin'
                }
            });
        }
    }

    // 2. If not admin, try to find a ChoirMember
    const member = await ChoirMember.findOne({ where: { email } });
    if (member) {
        if (member.password && await bcrypt.compare(password, member.password)) {
             const token = generateJWT(member, member.role);
             return res.json({ 
                token, 
                user: {
                    id: member.choirMemberId,
                    firstName: member.choirMemberFirstName,
                    lastName: member.choirMemberLastName,
                    email: member.email,
                    role: member.role,
                    status: member.status
                }
            });
        }
    }

    // 3. If neither found or password mismatch
    return res.status(401).json({ error: "Invalid email or password" });

  } catch (err) {
    logger.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.logOutAdmin = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(400).json({
        message: "No token provided in the request header",
        error: true
      });
    }

    const tokenValue = token.split(" ")[1];

    
    jwt.verify(tokenValue, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
       
        return res.status(401).json({
          message: "Unauthorized, token is invalid or already logged out",
          error: true
        });
      }

      
      res.clearCookie("token");

     
      return res.status(200).json({
        message: "Successfully logged out. Token invalidated.",
        error: false
      });
    });
  } catch (err) {
    logger.error("Error logging out admin:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: true
    });
  }
};


function generateJWT(user, role = 'admin') {
  return jwt.sign({ userId: user.id || user.choirMemberId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

exports.inviteMember = async (req, res) => {
  try {
    
    if (req.user.role !== 'admin' && !req.user.adminId) { 
       return res.status(403).json({ error: "Access denied. Only admins can invite members." });
    }

    const { email, role, firstName, lastName, gender, phoneNumber } = req.body;
    
    // Check if member already exists (by email)
    let member = await ChoirMember.findOne({ where: { email } });
    if (member) {
        return res.status(400).json({ error: "Member with this email already exists." });
    }

    // Generate secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // FOR TESTING ONLY: Log the token/link so the user can test without email
    logger.info(`[TESTING] Invitation Token for ${email}: ${verificationToken}`);
    logger.info(`[TESTING] Link: http://localhost:5173/auth/setup?token=${verificationToken}`);

    // Create the member with minimal info and "inactive" status until they set password
    const newMember = await ChoirMember.create({
        choirMemberFirstName: firstName || 'Invited',
        choirMemberLastName: lastName || 'User',
        choirMemberGender: gender || 'Not Specified',
        choirMemberPhoneNumber: phoneNumber || '0000000000', // needs unique logic ideally
        email,
        password: null, // No password yet
        verificationToken,
        role: role || 'attendance_taker',
        status: 'inactive' // Set to inactive until they set password
    });

    // Send email with link
    await emailService.sendInvitation(email, verificationToken, role);

    res.status(201).json({ message: "Invitation sent successfully", member: newMember });

  } catch (err) {
    logger.error("Error inviting member:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyInvitation = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token is required" });

        const member = await ChoirMember.findOne({ where: { verificationToken: token } });
        if (!member) {
            return res.status(400).json({ error: "Invalid or expired invitation token." });
        }

        res.status(200).json({ email: member.email, firstName: member.choirMemberFirstName });
    } catch (err) {
        logger.error("Error verifying invitation:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.setupPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const member = await ChoirMember.findOne({ where: { verificationToken: token } });

        if (!member) {
            return res.status(400).json({ error: "Invalid token." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await member.update({
            password: hashedPassword,
            verificationToken: null, // Clear token
            status: 'active'
        });

        res.status(200).json({ message: "Password set successfully. You can now login." });
    } catch (err) {
        logger.error("Error setting password:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};



exports.getGreetings = async (req, res) => {
  return res.status(200).json({ message: "Helloo there.." });
};
