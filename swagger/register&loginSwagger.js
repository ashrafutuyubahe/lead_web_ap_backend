/**
 * @swagger
 * /choir_manager/v1/auth/register:
 *   post:
 *     summary: Register an admin
 *     description: Registers a new admin with validation for email format, password strength, and duplicate checking
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
 *                 example: "John Doe"
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *               adminPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               adminPhoneNumber:
 *                 type: string
 *                 pattern: '^\d{10,15}$'
 *                 example: "1234567890"
 *             required:
 *               - adminName
 *               - adminEmail
 *               - adminPassword
 *               - adminPhoneNumber
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *       400:
 *         description: Validation error
 *       409:
 *         description: Admin already exists with this email or phone number
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/login:
 *   post:
 *     summary: Unified login for admin and members
 *     description: Logs in admin or choir member using email and password. Returns user profile with token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                       description: Admin name (for admins only)
 *                     firstName:
 *                       type: string
 *                       description: Member first name (for members only)
 *                     lastName:
 *                       type: string
 *                       description: Member last name (for members only)
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, member, attendance_taker]
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *                       description: Member status (for members only)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account not activated
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the current JWT token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out"
 *                 error:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: No valid token provided
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/invite:
 *   post:
 *     summary: Invite a new member
 *     description: Admin-only endpoint to invite members with email verification
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "member@example.com"
 *               role:
 *                 type: string
 *                 enum: [member, attendance_taker]
 *                 example: "attendance_taker"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *             required:
 *               - email
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only admins can invite members
 *       409:
 *         description: Member already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/invitations:
 *   get:
 *     summary: Get all invitations
 *     description: Admin-only endpoint to view all invited members and their status
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       choirMemberId:
 *                         type: integer
 *                       choirMemberFirstName:
 *                         type: string
 *                       choirMemberLastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, inactive]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/verify-invitation:
 *   post:
 *     summary: Verify invitation token
 *     description: Validates an invitation token and returns member details
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456"
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *       400:
 *         description: Token is required
 *       404:
 *         description: Invalid or expired invitation token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/auth/setup-password:
 *   post:
 *     summary: Setup password for invited member
 *     description: Allows invited member to set their password and activate account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *             required:
 *               - token
 *               - password
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password set successfully. You can now login"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
