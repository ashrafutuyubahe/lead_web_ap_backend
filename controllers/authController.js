const Admin = require("../models/admin");
const ChoirMember = require("../models/choirMember");
const emailService = require("../utils/emailService");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;
const validatePhoneNumber = (phone) => /^\d{10,15}$/.test(String(phone).replace(/\D/g, ''));

exports.registerAdmin = async (req, res) => {
  const { adminName, adminEmail, adminPassword, adminPhoneNumber } = req.body;

  if (!adminName?.trim() || !adminEmail?.trim() || !adminPassword || !adminPhoneNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validateEmail(adminEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validatePassword(adminPassword)) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  if (!validatePhoneNumber(adminPhoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ adminEmail }, { adminPhoneNumber }]
      }
    });

    if (existingAdmin) {
      return res.status(409).json({
        error: "Admin already exists with this email or phone number"
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await Admin.create({
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword: hashedPassword,
      adminPhoneNumber: String(adminPhoneNumber)
    });

    logger.info(`Admin registered: ${adminEmail}`);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    logger.error("Error registering admin:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "Admin with this information already exists" });
    }
    
    res.status(500).json({ 
      error: "Registration failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const admin = await Admin.findOne({ where: { adminEmail: email } });
    
    if (admin && await bcrypt.compare(password, admin.adminPassword)) {
      const token = generateJWT(admin, 'admin');
      logger.info(`Admin login: ${email}`);
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

    const member = await ChoirMember.findOne({ where: { email } });
    
    if (member) {
      if (member.status === 'inactive') {
        return res.status(403).json({ 
          error: "Account not activated. Please check your email for activation link" 
        });
      }

      if (member.password && await bcrypt.compare(password, member.password)) {
        const token = generateJWT(member, member.role);
        logger.info(`Member login: ${email}`);
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

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    logger.error("Error during login:", error);
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.logOutAdmin = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        message: "No valid token provided",
        error: true
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid or expired token",
          error: true
        });
      }

      res.clearCookie("token");
      return res.status(200).json({
        message: "Successfully logged out",
        error: false
      });
    });
  } catch (error) {
    logger.error("Error during logout:", error);
    return res.status(500).json({
      message: "Logout failed",
      error: true
    });
  }
};

function generateJWT(user, role = 'admin') {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  
  return jwt.sign(
    { userId: user.id || user.choirMemberId, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: "1d" }
  );
}

exports.inviteMember = async (req, res) => {
  if (req.user.role !== 'admin' && !req.user.adminId) { 
    return res.status(403).json({ error: "Only admins can invite members" });
  }

  const { email, role, firstName, lastName, gender, phoneNumber } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const existingMember = await ChoirMember.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          ...(phoneNumber ? [{ choirMemberPhoneNumber: String(phoneNumber) }] : [])
        ]
      } 
    });

    if (existingMember) {
      return res.status(409).json({ 
        error: "Member with this email or phone number already exists" 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    logger.info(`Invitation token for ${email}: ${verificationToken}`);

    const newMember = await ChoirMember.create({
      choirMemberFirstName: firstName?.trim() || 'Invited',
      choirMemberLastName: lastName?.trim() || 'User',
      choirMemberGender: gender?.trim() || 'Not Specified',
      choirMemberPhoneNumber: phoneNumber ? String(phoneNumber) : crypto.randomBytes(8).toString('hex'),
      email: email.trim(),
      password: null,
      verificationToken,
      role: role || 'attendance_taker',
      status: 'inactive'
    });

    await emailService.sendInvitation(email, verificationToken, role);

    logger.info(`Member invited: ${email}`);
    res.status(201).json({ 
      message: "Invitation sent successfully", 
      member: {
        id: newMember.choirMemberId,
        email: newMember.email,
        role: newMember.role
      }
    });
  } catch (error) {
    logger.error("Error inviting member:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: "Member already exists" });
    }
    
    res.status(500).json({ 
      error: "Failed to send invitation",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyInvitation = async (req, res) => {
  const { token } = req.body;
  
  if (!token?.trim()) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const member = await ChoirMember.findOne({ 
      where: { verificationToken: token } 
    });

    if (!member) {
      return res.status(404).json({ error: "Invalid or expired invitation token" });
    }

    res.status(200).json({ 
      email: member.email, 
      firstName: member.choirMemberFirstName 
    });
  } catch (error) {
    logger.error("Error verifying invitation:", error);
    res.status(500).json({ 
      error: "Verification failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.setupPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token?.trim() || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const member = await ChoirMember.findOne({ 
      where: { verificationToken: token } 
    });

    if (!member) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await member.update({
      password: hashedPassword,
      verificationToken: null,
      status: 'active'
    });

    logger.info(`Password set for member: ${member.email}`);
    res.status(200).json({ message: "Password set successfully. You can now login" });
  } catch (error) {
    logger.error("Error setting password:", error);
    res.status(500).json({ 
      error: "Failed to set password",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const members = await ChoirMember.findAll({
      attributes: [
        'choirMemberId', 
        'choirMemberFirstName', 
        'choirMemberLastName', 
        'email', 
        'role', 
        'status', 
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ 
      invitations: members,
      total: members.length
    });
  } catch (error) {
    logger.error("Error fetching invitations:", error);
    res.status(500).json({ 
      error: "Failed to fetch invitations",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getGreetings = async (req, res) => {
  res.status(200).json({ message: "Hello there!" });
};
