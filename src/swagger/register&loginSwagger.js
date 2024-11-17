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
