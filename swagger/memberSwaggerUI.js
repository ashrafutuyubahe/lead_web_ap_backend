/**
 * @swagger
 * /choir_manager/v1/member/getAllCHoirMembers:
 *   get:
 *     summary: Get all choir members
 *     description: Retrieves all choir members with sorting by last name and first name
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Members retrieved successfully
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
 *                       choirMemberId:
 *                         type: integer
 *                       choirMemberFirstName:
 *                         type: string
 *                       choirMemberLastName:
 *                         type: string
 *                       choirMemberGender:
 *                         type: string
 *                       choirMemberPhoneNumber:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
 *                 totalMemberNumber:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/addChoirMember:
 *   post:
 *     summary: Add a new choir member
 *     description: Admin-only endpoint to add a new member with validation and duplicate checking
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choirMemberFirstName:
 *                 type: string
 *                 example: "John"
 *               choirMemberLastName:
 *                 type: string
 *                 example: "Doe"
 *               choirMemberGender:
 *                 type: string
 *                 example: "Male"
 *               choirMemberPhoneNumber:
 *                 type: string
 *                 pattern: '^\d{10,15}$'
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 enum: [member, attendance_taker]
 *                 default: member
 *             required:
 *               - choirMemberFirstName
 *               - choirMemberLastName
 *               - choirMemberGender
 *               - choirMemberPhoneNumber
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   type: object
 *       400:
 *         description: Validation error
 *       409:
 *         description: Member already exists with this phone number or email
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/upload_choirMemberFile:
 *   post:
 *     summary: Bulk upload choir members from Excel file
 *     description: Admin-only endpoint to upload multiple members via Excel file with validation
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
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
 *                 description: Excel file (.xlsx) with columns - FirstName, LastName, Gender, PhoneNumber, Email, Role
 *     responses:
 *       200:
 *         description: File processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                     duplicates:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *                 details:
 *                   type: object
 *                   properties:
 *                     duplicates:
 *                       type: array
 *                       items:
 *                         type: object
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: No file uploaded or invalid file format
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/updateMember/{id}:
 *   put:
 *     summary: Update a choir member
 *     description: Admin-only endpoint to update member details with duplicate checking
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [member, attendance_taker]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   type: object
 *       400:
 *         description: Validation error or no valid fields to update
 *       404:
 *         description: Member not found
 *       409:
 *         description: Another member already has this phone number or email
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/member/deleteMember/{id}:
 *   delete:
 *     summary: Delete a choir member
 *     description: Admin-only endpoint to delete member and all related records (cascade delete)
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 relationsRemoved:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       type: integer
 *                       description: Number of attendance records deleted
 *                     announcements:
 *                       type: integer
 *                       description: Number of announcements deleted
 *       400:
 *         description: Invalid member ID
 *       404:
 *         description: Member not found
 *       500:
 *         description: Internal server error
 */
