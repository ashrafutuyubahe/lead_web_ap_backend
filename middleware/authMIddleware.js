const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require("../models/admin");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store the entire decoded token (id, role, etc.)

    // Optional: Verify existence in DB if strict validation is needed
    // For performance, we might trust the token signature + role
    // But let's keep it safe:
    if (decoded.role === 'admin') {
         const admin = await require("../models/admin").findByPk(decoded.userId || decoded.adminId); // Handle legacy adminId
         if (!admin) throw new Error("Admin not found");
         req.userRecord = admin;
    } else {
         const member = await require("../models/choirMember").findByPk(decoded.userId);
         if (!member) throw new Error("Member not found");
         req.userRecord = member;
    }

    next();
  } catch (err) {
    logger.error("Authentication failed:", err);

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token has expired" });
    }

    return res.status(401).json({ error: "Authentication failed" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
