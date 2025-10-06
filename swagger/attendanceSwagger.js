/**
 * @swagger
 * /choir_manager/v1/attendaces/markAttendence:
 *   post:
 *     summary: Mark attendance for choir members
 *     description: Marks the attendance of choir members based on the provided data.
 *     requestBody:
 *       description: Attendance data to be marked
 *       required: true
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
 *                       enum: ['present', 'absent', 'authorized']
 *                       example: 'present'
 *           examples:
 *             example-1:
 *               summary: Sample attendance data
 *               value:
 *                 data:
 *                   - attendanceType: "church"
 *                     ChoirMemberId: 1
 *                     attendanceDate: "2024-10-01"
 *                     attendanceStatus: "present"
 *                   - attendanceType: "wedding"
 *                     ChoirMemberId: 1
 *                     attendanceDate: "2024-09-15"
 *                     attendanceStatus: "absent"
 *                   - attendanceType: "Death"
 *                     ChoirMemberId: 1
 *                     attendanceDate: "2024-08-20"
 *                     attendanceStatus: "authorized"
 *                   - attendanceType: "church"
 *                     ChoirMemberId: 2
 *                     attendanceDate: "2024-10-03"
 *                     attendanceStatus: "present"
 *                   - attendanceType: "wedding"
 *                     ChoirMemberId: 2
 *                     attendanceDate: "2024-09-12"
 *                     attendanceStatus: "absent"
 *                   - attendanceType: "Death"
 *                     ChoirMemberId: 2
 *                     attendanceDate: "2024-08-18"
 *                     attendanceStatus: "authorized"
 *                   - attendanceType: "church"
 *                     ChoirMemberId: 3
 *                     attendanceDate: "2024-10-05"
 *                     attendanceStatus: "authorized"
 *                   - attendanceType: "wedding"
 *                     ChoirMemberId: 3
 *                     attendanceDate: "2024-09-19"
 *                     attendanceStatus: "present"
 *                   - attendanceType: "Death"
 *                     ChoirMemberId: 3
 *                     attendanceDate: "2024-08-25"
 *                     attendanceStatus: "absent"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Attendance marked successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attendanceType:
 *                         type: string
 *                       ChoirMemberId:
 *                         type: integer
 *                       attendanceDate:
 *                         type: string
 *                         format: date
 *                       attendanceStatus:
 *                         type: string
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
