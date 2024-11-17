
/**
 * @swagger
 * /choir_manager/v1/attendances/getAttendanceStatistics:
 *   get:
 *     summary: Get attendance statistics for choir members
 *     description: Fetches statistics such as attendance percentage for each attendance type.
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
 *                 attendanceStatistics:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         month:
 *                           type: integer
 *                           example: 11
 *                         attendancePercentage:
 *                           type: string
 *                           example: "90.00"
 *                 overallAttendancePercentage:
 *                   type: string
 *                   example: "95.00"
 *       500:
 *         description: Server error
 */

module.exports = {
    getAttendanceStatistics: '/choir_manager/v1/attendance/getAttendanceStatistics'
  };
  