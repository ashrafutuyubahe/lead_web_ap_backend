const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const registerSwagger = require('../swagger/register&loginSwagger');


router.post('/register', authController.registerAdmin);

router.post('/login', authController.loginAdmin);
router.post("/logout",authController.logOutAdmin);
router.get("/getGreetings",authController.getGreetings);

module.exports = router;    