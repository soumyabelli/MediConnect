const express = require('express')
const { protect, requireRole } = require('../middleware/authMiddleware')
const { bookAppointment, getAppointmentById, getAvailability, updateAppointmentStatus } = require('../controllers/appointmentController')

const router = express.Router()

router.get('/availability', protect, requireRole('patient', 'doctor', 'admin'), getAvailability)
router.get('/:appointmentId', protect, requireRole('patient', 'doctor', 'admin'), getAppointmentById)
router.post('/book', protect, requireRole('patient'), bookAppointment)
router.patch('/:appointmentId/status', protect, requireRole('doctor'), updateAppointmentStatus)

module.exports = router
