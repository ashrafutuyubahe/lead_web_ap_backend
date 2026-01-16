const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const registerSwagger = require('../swagger/register&loginSwagger');


router.post('/register', authController.registerAdmin);

router.post('/login', authController.login);
// router.post('/member/signin', authController.loginMember); // Deprecated in favor of unified /login
const { authMiddleware, authorize } = require("../middleware/authMIddleware");
router.post('/invite', authMiddleware, authorize('admin'), authController.inviteMember);

router.post("/logout",authController.logOutAdmin);
router.get("/getGreetings",authController.getGreetings);


router.post("/verify-invitation", authController.verifyInvitation);
router.post("/setup-password", authController.setupPassword);

module.exports = router;    