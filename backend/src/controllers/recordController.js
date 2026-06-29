const Appointment = require('../models/Appointment')
const Record = require('../models/Record')
const User = require('../models/User')
const { isConnected } = require('../config/db')
const { emitDashboardUpdate, emitRecordUpdate, emitAppointmentUpdate } = require('../utils/realtime')

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeMaybeDate(value) {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

function normalizePrescriptionDetails(input) {
  const raw = input && typeof input === 'object' ? input : {}
  const medicines = Array.isArray(raw.medicines) ? raw.medicines : []

  return {
    diagnosis: normalizeText(raw.diagnosis),
    medicines: medicines
      .map((item) => ({
        name: normalizeText(item?.name),
        dosage: normalizeText(item?.dosage),
        duration: normalizeText(item?.duration),
        instructions: normalizeText(item?.instructions),
      }))
      .filter((item) => item.name || item.dosage || item.duration || item.instructions),
    notes: normalizeText(raw.notes),
    followUpDate: normalizeMaybeDate(raw.followUpDate),
  }
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
      prescriptionDetails = null,
      type = 'Consultation Note',
    } = req.body || {}

    if (!patientId || !title || !summary || !prescription) {
      return res.status(400).json({ message: 'patientId, title, summary, and prescription are required.' })
    }

    const normalizedType = normalizeText(type) || 'Consultation Note'
    const isPrescription = normalizedType.toLowerCase().includes('prescription')
    if (isPrescription && !appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required for prescriptions.' })
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

      if (['Cancelled', 'Rejected'].includes(String(appointment.status))) {
        return res.status(400).json({ message: 'Cannot write prescriptions for rejected appointments.' })
      }

      if (!['Confirmed', 'Accepted', 'In Consultation', 'Completed'].includes(String(appointment.status))) {
        return res.status(400).json({ message: 'The appointment must be accepted before writing a prescription.' })
      }
    }

    const record = await Record.create({
      appointment: appointment ? appointment._id : null,
      patient: patient._id,
      doctor: req.user._id,
      recordDate: new Date(),
      title: normalizeText(title),
      summary: normalizeText(summary),
      prescription: normalizeText(prescription),
      prescriptionDetails: normalizePrescriptionDetails(prescriptionDetails),
      type: normalizedType,
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
        appointmentId: record.appointment ? String(record.appointment) : '',
        patientId: String(record.patient),
        doctorId: String(record.doctor),
        date: String(record.recordDate),
        title: record.title,
        summary: record.summary,
        prescription: record.prescription,
        prescriptionDetails: record.prescriptionDetails || null,
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
