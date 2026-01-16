/**
 * @swagger
 * /choir_manager/v1/announcements/send:
 *   post:
 *     summary: Send announcement to all active members
 *     description: Admin-only endpoint to create and send announcements via email
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Choir Practice Schedule"
 *               message:
 *                 type: string
 *                 example: "Practice will be held every Tuesday at 6 PM"
 *             required:
 *               - title
 *               - message
 *     responses:
 *       201:
 *         description: Announcement sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 emailsSent:
 *                   type: integer
 *                 announcement:
 *                   type: object
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /choir_manager/v1/announcements:
 *   get:
 *     summary: Get all announcements
 *     description: Retrieve announcements with pagination support
 *     tags:
 *       - Announcements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of announcements to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of announcements to skip
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 announcements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       choirMemberId:
 *                         type: integer
 *                       dateSent:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
