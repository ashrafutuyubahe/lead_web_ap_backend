const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const authMiddleware= require("../middleware/authMIddleware");

const memberSwaggerUI= require("../swagger/memberSwaggerUI");

router.get("/getAllCHoirMembers", authMiddleware,memberController.getAllMembers);

router.post("/addChoirMember",authMiddleware,memberController.addMember);

router.post("/upload_choirMemberFile", authMiddleware,memberController.uploadChoirMembers);

module.exports = router;
