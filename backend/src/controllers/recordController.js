const Appointment = require('../models/Appointment')
const Record = require('../models/Record')
const User = require('../models/User')
const { isConnected } = require('../config/db')
const { emitDashboardUpdate, emitRecordUpdate, emitAppointmentUpdate } = require('../utils/realtime')

function normalizeText(value) {
  return String(value || '').trim()
}

async function createRecord(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const {
      patientId,
      appointmentId = '',
      title,
      summary,
      prescription,
      type = 'Consultation Note',
    } = req.body || {}

    if (!patientId || !title || !summary || !prescription) {
      return res.status(400).json({ message: 'patientId, title, summary, and prescription are required.' })
    }

    const patient = await User.findById(patientId)
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found.' })
    }

    let appointment = null
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId)
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found.' })
      }

      if (String(appointment.doctor) !== String(req.user._id)) {
        return res.status(403).json({ message: 'You can only write prescriptions for your own appointments.' })
      }

      if (String(appointment.patient) !== String(patient._id)) {
        return res.status(400).json({ message: 'Selected appointment does not match the patient.' })
      }

      if (!['Confirmed', 'In Consultation', 'Completed'].includes(String(appointment.status))) {
        return res.status(400).json({ message: 'The appointment must be confirmed before writing a prescription.' })
      }
    }

    const record = await Record.create({
      patient: patient._id,
      doctor: req.user._id,
      recordDate: new Date(),
      title: normalizeText(title),
      summary: normalizeText(summary),
      prescription: normalizeText(prescription),
      type: normalizeText(type) || 'Consultation Note',
    })

    const updates = {
      lastVisitAt: new Date(),
    }

    if (patient.status !== 'Active') {
      updates.status = 'Active'
    }

    await User.findByIdAndUpdate(patient._id, updates)

    if (appointment && appointment.status !== 'Completed') {
      appointment.status = 'Completed'
      appointment.notes = normalizeText(summary)
      await appointment.save()
    }

    const payload = {
      record: {
        id: String(record._id),
        patientId: String(record.patient),
        doctorId: String(record.doctor),
        date: String(record.recordDate),
        title: record.title,
        summary: record.summary,
        prescription: record.prescription,
        type: record.type,
      },
    }

    emitRecordUpdate(record, payload)
    if (appointment) {
      emitAppointmentUpdate(appointment, {
        appointment: {
          id: String(appointment._id),
          doctorId: String(appointment.doctor),
          patientId: String(appointment.patient),
          date: String(appointment.appointmentDate),
          time: appointment.timeLabel,
          status: appointment.status,
          mode: appointment.mode,
          reason: appointment.reason,
          notes: appointment.notes || '',
        },
      })
    }
    emitDashboardUpdate(patient._id, { reason: 'record-created' })
    emitDashboardUpdate(req.user._id, { reason: 'record-created' })

    return res.status(201).json(payload)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createRecord,
}
