const express = require("express");
const router = express.Router();
const announcementsController = require("../controllers/announcementsController");
const { authMiddleware, authorize } = require("../middleware/authMIddleware");

router.post("/send", authMiddleware, authorize('admin'), announcementsController.createAnnouncement);
router.get("/", authMiddleware, authorize('admin', 'attendance_taker', 'member'), announcementsController.getAnnouncements);

module.exports = router;
