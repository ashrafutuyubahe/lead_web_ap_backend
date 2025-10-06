/**
 * @swagger
 * /choir_manager/v1/auth/register:
 *   post:
 *     summary: Register an admin
 *     description: Registers a new admin by providing admin details like name, email, phone number, and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminName:
 *                 type: string
 *                 example: "adminUser"
 *               adminEmail:
 *                 type: string
 *                 example: "admin@example.com"
 *               adminPassword:
 *                 type: string
 *                 example: "password123"
 *               adminPhoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *             required:
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *               - adminPhoneNumber
 *     responses:
 *       201:
 *         description: Admin registered successfully and JWT token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Bad request, admin with the provided email or phone number already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/login:
 *   post:
 *     summary: Login an admin
 *     description: Logs in an admin by verifying email and password, and generates a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminEmail:
 *                 type: string
 *                 example: "admin@example.com"
 *               adminPassword:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - adminEmail
 *               - adminPassword
 *     responses:
 *       200:
 *         description: Admin logged in successfully and JWT token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/logout:
 *   post:
 *     summary: Logout an admin
 *     description: Logs out the admin by invalidating their JWT token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []  # Ensure this matches your Swagger security configuration
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out. Token invalidated."
 *       400:
 *         description: No token provided in the request header
 *       401:
 *         description: Unauthorized, token is invalid or already logged out
 *       500:
 *         description: Internal server error
 */

