const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMIddleware");
const attendenceController = require("../controllers/attendenceController");

// Import Swagger documentation
const attendanceSwagger = require("../swagger/attendanceSwagger");
const statisticsSwagger = require("../swagger/statisticsSwagger");


router.post('/markAttendence', authMiddleware, attendenceController.markAttendance);

router.get("/getAttendanceStatistics", authMiddleware, attendenceController.getAttendanceStatistics);
router.get("/search",attendenceController.searchByName);

module.exports = router;
