/**
 * @swagger
 * /choir_manager/v1/member/addChoirMember:
 *   post:
 *     summary: Add a new choir member
 *     description: Adds a new member to the choir with the provided details and returns the added member and a success message.
 *     tags:
 *       - Choir Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choirMemberFirstName:
 *                 type: string
 *               choirMemberLastName:
 *                 type: string
 *               choirMemberGender:
 *                 type: string
 *               choirMemberPhoneNumber:
 *                 type: string
 *             required:
 *               - choirMemberFirstName
 *               - choirMemberLastName
 *               - choirMemberGender
 *               - choirMemberPhoneNumber
 *     responses:
 *       201:
 *         description: Choir member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Choir member added successfully
 *                 member:
 *                   type: object
 *                   properties:
 *                     choirMemberFirstName:
 *                       type: string
 *                     choirMemberLastName:
 *                       type: string
 *                     choirMemberGender:
 *                       type: string
 *                     choirMemberPhoneNumber:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required: choirMemberFirstName, choirMemberLastName, choirMemberGender, and choirMemberPhoneNumber.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to add choir member.
 */
