const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const registerSwagger = require('../swagger/register&loginSwagger');


router.post('/register', authController.registerAdmin);

router.post('/login', authController.loginAdmin);
router.post('/member/signin', authController.loginMember); // Differentiate path
const { authMiddleware, authorize } = require("../middleware/authMIddleware");
router.post('/invite', authMiddleware, authorize('admin'), authController.inviteMember); // Admin only

router.post("/logout",authController.logOutAdmin);
router.get("/getGreetings",authController.getGreetings);


router.post("/verify-invitation", authController.verifyInvitation);
router.post("/setup-password", authController.setupPassword);

module.exports = router;    