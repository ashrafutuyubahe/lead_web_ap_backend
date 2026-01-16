const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/authMIddleware");
const attendenceController = require("../controllers/attendenceController");

// Import Swagger documentation
const attendanceSwagger = require("../swagger/attendanceSwagger");
const statisticsSwagger = require("../swagger/statisticsSwagger");


router.post('/markAttendence', authMiddleware, authorize('admin', 'attendance_taker'), attendenceController.markAttendance);

router.get("/getAttendanceStatistics", authMiddleware, authorize('admin'), attendenceController.getAttendanceStatistics);
router.get("/search", authMiddleware, authorize('admin', 'attendance_taker'), attendenceController.searchByName);

module.exports = router;
