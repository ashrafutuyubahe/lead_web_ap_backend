/**
 * @swagger
 * /choir_manager/v1/member/addChoirMember:
 *   post:
 *     summary: Add a new choir member
 *     description: Adds a new member to the choir with the provided details.
 *     tags:
 *       - Choir Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberFirstName:
 *                 type: string
 *               memberLastName:
 *                 type: string
 *               MemberGender:
 *                 type: string
 *               memberPhoneNumber:
 *                 type: string
 *             required:
 *               - memberFirstName
 *               - memberLastName
 *               - MemberGender
 *               - memberPhoneNumber
 *     responses:
 *       201:
 *         description: Choir member added successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/getAllCHoirMembers:
 *   get:
 *     summary: Get all choir members
 *     description: Retrieves all choir members from the database.
 *     tags:
 *       - Choir Members
 *     responses:
 *       200:
 *         description: List of choir members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberFirstName:
 *                         type: string
 *                       memberLastName:
 *                         type: string
 *                       MemberGender:
 *                         type: string
 *                       memberPhoneNumber:
 *                         type: string
 *                 totalMemberNumber:
 *                   type: integer
 *       404:
 *         description: No choir members found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/upload_choirMemberFile:
 *   post:
 *     summary: Upload choir members from file
 *     description: Uploads an Excel file to add multiple choir members in bulk.
 *     tags:
 *       - Choir Members
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File processed successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
