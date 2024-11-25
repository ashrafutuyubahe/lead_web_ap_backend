const Admin = require("../models/admin");
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

exports.loginAdmin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body;

    const admin = await Admin.findOne({ where: { adminEmail } });
    if (!admin || !(await bcrypt.compare(adminPassword, admin.adminPassword))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateJWT(admin);
    res.json({ token });
  } catch (err) {
    logger.error("Error logging in admin:", err);
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


function generateJWT(admin) {
  return jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

exports.getGreetings = async (req, res) => {
  return res.status(200).json({ message: "Helloo there.." });
};
