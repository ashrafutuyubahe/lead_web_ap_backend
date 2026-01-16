const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { authMiddleware, authorize } = require("../middleware/authMIddleware");

const memberSwaggerUI= require("../swagger/memberSwaggerUI");

router.get("/getAllCHoirMembers", authMiddleware, authorize('admin', 'attendance_taker'), memberController.getAllMembers);

router.post("/addChoirMember",authMiddleware, authorize('admin'), memberController.addMember);

router.post("/upload_choirMemberFile", authMiddleware, authorize('admin'), memberController.uploadChoirMembers);

module.exports = router;
