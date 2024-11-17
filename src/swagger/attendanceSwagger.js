/**
 * @swagger
 * /choir_manager/v1/attendances/markAttendence:
 *   post:
 *     summary: Mark attendance for choir members
 *     description: Marks the attendance of choir members based on the provided data.
 *     requestBody:
 *       description: Attendance data to be marked
 *       content:
 *         application/json:
 *           schema:    
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attendanceType:
 *                       type: string
 *                       example: 'church'
 *                     ChoirMemberId:
 *                       type: integer
 *                       example: 1
 *                     attendanceDate:
 *                       type: string
 *                       format: date
 *                       example: '2024-11-15'
 *                     attendanceStatus:
 *                       type: string
 *                       enum: ['present', 'absent']
 *                       example: 'present'
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */

module.exports = {
    markAttendance: '/choir_manager/v1/attendance/markAttendence'
  };
  