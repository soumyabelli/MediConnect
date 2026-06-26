const Appointment = require('../models/Appointment')
const User = require('../models/User')
const { isConnected } = require('../config/db')
const { emitAppointmentUpdate, emitDashboardUpdate } = require('../utils/realtime')

const AVAILABLE_TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM']
const APPOINTMENT_STATUS_VALUES = ['Pending', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled']

function toDayBounds(input) {
  const base = new Date(input)

  if (Number.isNaN(base.getTime())) {
    return null
  }

  const start = new Date(base)
  start.setHours(0, 0, 0, 0)

  const end = new Date(base)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function normalizeTimeLabel(value) {
  return String(value || '').trim()
}

function normalizeStatus(value) {
  return String(value || '').trim()
}

async function getBookedSlots({ doctorId, appointmentDate }) {
  const bounds = toDayBounds(appointmentDate)

  if (!bounds) {
    return null
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: bounds.start,
      $lte: bounds.end,
    },
    status: { $ne: 'Cancelled' },
  }).select('timeLabel status')

  return appointments.map((appointment) => normalizeTimeLabel(appointment.timeLabel)).filter(Boolean)
}

async function bookAppointment(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const {
      doctorId,
      appointmentDate,
      timeLabel,
      reason,
      mode = 'Online',
    } = req.body || {}

    if (!doctorId || !appointmentDate || !timeLabel || !reason) {
      return res.status(400).json({ message: 'doctorId, appointmentDate, timeLabel, and reason are required.' })
    }

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found.' })
    }

    const patient = req.user
    const bounds = toDayBounds(appointmentDate)

    if (!bounds) {
      return res.status(400).json({ message: 'appointmentDate must be a valid date.' })
    }

    const normalizedTime = normalizeTimeLabel(timeLabel)
    const conflict = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate: {
        $gte: bounds.start,
        $lte: bounds.end,
      },
      timeLabel: normalizedTime,
      status: { $ne: 'Cancelled' },
    }).select('_id')

    if (conflict) {
      return res.status(409).json({
        message: 'That time slot is already booked for this doctor. Please choose another available slot.',
      })
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: bounds.start,
      timeLabel: normalizedTime,
      status: 'Pending',
      mode: String(mode).trim() || 'Online',
      reason: String(reason).trim(),
    })

    const payload = {
      appointment: {
        id: String(appointment._id),
        doctorId: String(appointment.doctor),
        patientId: String(appointment.patient),
        date: String(appointment.appointmentDate),
        time: appointment.timeLabel,
        status: appointment.status,
        mode: appointment.mode,
        reason: appointment.reason,
      },
    }

    emitAppointmentUpdate(appointment, payload)
    emitDashboardUpdate(patient._id, { reason: 'appointment-created' })
    emitDashboardUpdate(doctor._id, { reason: 'appointment-created' })

    return res.status(201).json(payload)
  } catch (error) {
    return next(error)
  }
}

async function getAvailability(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const { doctorId, appointmentDate } = req.query || {}

    if (!doctorId || !appointmentDate) {
      return res.status(400).json({ message: 'doctorId and appointmentDate are required.' })
    }

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found.' })
    }

    const bookedSlots = await getBookedSlots({ doctorId: doctor._id, appointmentDate })
    if (!bookedSlots) {
      return res.status(400).json({ message: 'appointmentDate must be a valid date.' })
    }

    const availableSlots = AVAILABLE_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot))

    return res.json({
      doctorId: String(doctor._id),
      appointmentDate: new Date(appointmentDate).toISOString(),
      bookedSlots,
      availableSlots,
    })
  } catch (error) {
    return next(error)
  }
}

async function getAppointmentById(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patient')
      .populate('doctor')

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' })
    }

    const isOwner = String(appointment.patient?._id || appointment.patient) === String(req.user._id) || String(appointment.doctor?._id || appointment.doctor) === String(req.user._id)
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only access your own appointment.' })
    }

    return res.json({
      appointment: {
        id: String(appointment._id),
        doctorId: String(appointment.doctor?._id || appointment.doctor),
        patientId: String(appointment.patient?._id || appointment.patient),
        date: String(appointment.appointmentDate),
        time: appointment.timeLabel,
        status: appointment.status,
        mode: appointment.mode,
        reason: appointment.reason,
        notes: appointment.notes || '',
        patient: appointment.patient ? {
          id: String(appointment.patient._id),
          name: appointment.patient.name,
          email: appointment.patient.email,
        } : null,
        doctor: appointment.doctor ? {
          id: String(appointment.doctor._id),
          name: appointment.doctor.name,
          email: appointment.doctor.email,
        } : null,
      },
    })
  } catch (error) {
    return next(error)
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const { appointmentId } = req.params || {}
    const { status, notes = '', reason = '' } = req.body || {}

    if (!appointmentId || !status) {
      return res.status(400).json({ message: 'appointmentId and status are required.' })
    }

    const normalizedStatus = normalizeStatus(status)
    if (!APPOINTMENT_STATUS_VALUES.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid appointment status.' })
    }

    const appointment = await Appointment.findById(appointmentId).populate('patient').populate('doctor')
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' })
    }

    if (String(appointment.doctor._id || appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only update appointments assigned to you.' })
    }

    appointment.status = normalizedStatus
    if (normalizedStatus === 'Cancelled') {
      appointment.notes = String(reason || notes || appointment.notes || '').trim()
    } else if (normalizedStatus === 'In Consultation' || normalizedStatus === 'Completed') {
      appointment.notes = String(notes || appointment.notes || '').trim()
    }
    await appointment.save()

    const payload = {
      appointment: {
        id: String(appointment._id),
        doctorId: String(appointment.doctor?._id || appointment.doctor),
        patientId: String(appointment.patient?._id || appointment.patient),
        date: String(appointment.appointmentDate),
        time: appointment.timeLabel,
        status: appointment.status,
        mode: appointment.mode,
        reason: appointment.reason,
        notes: appointment.notes || '',
      },
    }

    emitAppointmentUpdate(appointment, payload)
    emitDashboardUpdate(appointment.patient?._id || appointment.patient, { reason: 'appointment-status-updated' })
    emitDashboardUpdate(appointment.doctor?._id || appointment.doctor, { reason: 'appointment-status-updated' })

    return res.json(payload)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  AVAILABLE_TIME_SLOTS,
  bookAppointment,
  getAppointmentById,
  getAvailability,
  updateAppointmentStatus,
}
