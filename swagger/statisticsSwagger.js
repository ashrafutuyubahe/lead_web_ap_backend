/**
 * @swagger
 * /choir_manager/v1/attendaces/getAttendanceStatistics:
 *   get:
 *     summary: Get attendance statistics for choir members
 *     description: Fetches statistics such as attendance percentage for each attendance type, including overall attendance.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *           example: "Bearer your_jwt_token_here"
 *     responses:
 *       200:
 *         description: Successfully fetched attendance statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalChoirMembers:
 *                   type: integer
 *                   example: 50
 *                 overallAttendancePercentage:
 *                   type: string
 *                   example: "36.67"
 *                 totalAttendances:
 *                   type: integer
 *                   example: 60
 *                 attendanceStatistics:
 *                   type: object
 *                   properties:
 *                     wedding:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 11
 *                           presentCount:
 *                             type: integer
 *                             example: 8
 *                           totalCount:
 *                             type: integer
 *                             example: 20
 *                           attendancePercentage:
 *                             type: string
 *                             example: "40.00"
 *                     Repetition:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 11
 *                           presentCount:
 *                             type: integer
 *                             example: 0
 *                           totalCount:
 *                             type: integer
 *                             example: 2
 *                           attendancePercentage:
 *                             type: string
 *                             example: "0.00"
 *                     church:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 11
 *                           presentCount:
 *                             type: integer
 *                             example: 14
 *                           totalCount:
 *                             type: integer
 *                             example: 20
 *                           attendancePercentage:
 *                             type: string
 *                             example: "70.00"
 *                     Death:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 11
 *                           presentCount:
 *                             type: integer
 *                             example: 0
 *                           totalCount:
 *                             type: integer
 *                             example: 18
 *                           attendancePercentage:
 *                             type: string
 *                             example: "0.00"
 *       500:
 *         description: Server error
 *       404:
 *         description: No attendance records found for the requested criteria
 *     security:
 *       - bearerAuth: []
 * securityDefinitions:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */

module.exports = {
  getAttendanceStatistics: '/choir_manager/v1/attendances/getAttendanceStatistics'
};
