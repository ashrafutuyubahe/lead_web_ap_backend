const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { authMiddleware, authorize } = require("../middleware/authMIddleware");
const upload = require("../middleware/uploadMiddleware");

const memberSwaggerUI = require("../swagger/memberSwaggerUI");

router.get(
  "/getAllCHoirMembers",
  authMiddleware,
  authorize("admin", "attendance_taker"),
  memberController.getAllMembers,
);

router.post(
  "/addChoirMember",
  authMiddleware,
  authorize("admin"),
  memberController.addMember,
);

router.post(
  "/upload_choirMemberFile",
  authMiddleware,
  authorize("admin"),
  upload.single("file"),
  memberController.uploadChoirMembers,
);

router.put(
  "/updateMember/:id",
  authMiddleware,
  authorize("admin"),
  memberController.updateMember,
);
router.delete(
  "/deleteMember/:id",
  authMiddleware,
  authorize("admin"),
  memberController.deleteMember,
);
router.get(
  "/download-members",
  authMiddleware,
  authorize("admin", "attendance_taker"),
  memberController.downloadMembersReport,
);
router.get(
  "/download-template",
  authMiddleware,
  authorize("admin"),
  memberController.downloadUploadTemplate,
);

module.exports = router;
