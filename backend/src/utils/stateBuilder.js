const User = require('../models/User')
const Appointment = require('../models/Appointment')
const Record = require('../models/Record')
const { formatDisplayDate, splitTreats } = require('./format')

function idOf(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (value?._id) {
    return String(value._id)
  }

  return String(value)
}

function baseUserDto(user) {
  if (!user) {
    return null
  }

  return {
    id: idOf(user._id),
    role: user.role,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    title: user.title || '',
    specialization: user.specialization || '',
    treats: splitTreats(user.treats).join(', '),
    availability: user.availability || '',
    status: user.status || 'Active',
    fee: user.fee || '',
    experience: user.experience || '',
    city: user.city || '',
    bio: user.bio || '',
    credentialStatus: 'Stored securely',
  }
}

function doctorDto(user) {
  return baseUserDto(user)
}

function patientDto(user) {
  if (!user) {
    return null
  }

  return {
    ...baseUserDto(user),
    age: user.age || '',
    gender: user.gender || '',
    condition: user.condition || '',
    bloodGroup: user.bloodGroup || '',
    address: user.address || '',
    notes: user.notes || '',
    assignedDoctorId: idOf(user.assignedDoctorId),
    registeredAt: formatDisplayDate(user.registeredAt || user.createdAt),
    lastVisit: user.lastVisitAt ? formatDisplayDate(user.lastVisitAt) : 'New patient',
  }
}

function appointmentDto(appointment, patient, doctor) {
  return {
    id: idOf(appointment._id),
    patientId: idOf(appointment.patient?._id || appointment.patient),
    doctorId: idOf(appointment.doctor?._id || appointment.doctor),
    date: formatDisplayDate(appointment.appointmentDate),
    time: appointment.timeLabel || '',
    status: appointment.status || 'Pending',
    mode: appointment.mode || 'Online',
    reason: appointment.reason || '',
    notes: appointment.notes || '',
    patient: baseUserDto(patient),
    doctor: baseUserDto(doctor),
  }
}

function recordDto(record, patient, doctor) {
  return {
    id: idOf(record._id),
    appointmentId: idOf(record.appointment),
    patientId: idOf(record.patient),
    doctorId: idOf(record.doctor),
    date: formatDisplayDate(record.recordDate),
    title: record.title || '',
    summary: record.summary || '',
    prescription: record.prescription || '',
    prescriptionDetails: record.prescriptionDetails || null,
    type: record.type || '',
    patient: baseUserDto(patient),
    doctor: baseUserDto(doctor),
  }
}

async function buildAdminState() {
  const [admin, doctors, patients, appointments, records] = await Promise.all([
    User.findOne({ role: 'admin' }),
    User.find({ role: 'doctor' }).sort({ createdAt: -1 }),
    User.find({ role: 'patient' }).sort({ createdAt: -1 }),
    Appointment.find().sort({ appointmentDate: -1, createdAt: -1 }),
    Record.find().sort({ recordDate: -1, createdAt: -1 }),
  ])

  const userLookup = new Map()
  ;[admin, ...doctors, ...patients].forEach((user) => {
    if (user) {
      userLookup.set(idOf(user._id), user)
    }
  })

  return {
    admin: baseUserDto(admin),
    doctors: doctors.map(doctorDto),
    patients: patients.map(patientDto),
    appointments: appointments.map((appointment) =>
      appointmentDto(
        appointment,
        userLookup.get(idOf(appointment.patient)),
        userLookup.get(idOf(appointment.doctor)),
      ),
    ),
    records: records.map((record) =>
      recordDto(
        record,
        userLookup.get(idOf(record.patient)),
        userLookup.get(idOf(record.doctor)),
      ),
    ),
  }
}

async function buildDoctorState(doctorId) {
  const doctor = await User.findById(doctorId)
  if (!doctor) {
    return null
  }

  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate('patient')
    .populate('doctor')
    .sort({
      appointmentDate: -1,
      createdAt: -1,
    })
  const assignedPatients = await User.find({ role: 'patient', assignedDoctorId: doctor._id }).sort({
    createdAt: -1,
  })
  const records = await Record.find({ doctor: doctor._id }).sort({
    recordDate: -1,
    createdAt: -1,
  })

  const patientLookup = new Map(assignedPatients.map((patient) => [idOf(patient._id), patient]))
  appointments
    .map((appointment) => appointment.patient)
    .filter(Boolean)
    .forEach((patient) => {
      const key = idOf(patient._id)
      if (key && !patientLookup.has(key)) {
        patientLookup.set(key, patient)
      }
    })
  const patients = Array.from(patientLookup.values())

  return {
    admin: null,
    doctors: [doctorDto(doctor)],
    patients: patients.map(patientDto),
    appointments: appointments.map((appointment) =>
      appointmentDto(
        appointment,
        appointment.patient,
        appointment.doctor,
      ),
    ),
    records: records.map((record) =>
      recordDto(
        record,
        patients.find((patient) => idOf(patient._id) === idOf(record.patient)) || null,
        doctor,
      ),
    ),
  }
}

async function buildPatientState(patientId) {
  const patient = await User.findById(patientId)
  if (!patient) {
    return null
  }

  const doctor = patient.assignedDoctorId ? await User.findById(patient.assignedDoctorId) : null
  const appointments = await Appointment.find({ patient: patient._id })
    .populate('patient')
    .populate('doctor')
    .sort({
      appointmentDate: -1,
      createdAt: -1,
    })
  const records = await Record.find({ patient: patient._id }).sort({
    recordDate: -1,
    createdAt: -1,
  })

  return {
    admin: null,
    doctors: doctor ? [doctorDto(doctor)] : [],
    patients: [patientDto(patient)],
    appointments: appointments.map((appointment) =>
      appointmentDto(
        appointment,
        appointment.patient,
        appointment.doctor,
      ),
    ),
    records: records.map((record) =>
      recordDto(
        record,
        patient,
        doctor,
      ),
    ),
  }
}

async function buildDashboardState(user) {
  if (!user) {
    return null
  }

  if (user.role === 'admin') {
    return buildAdminState()
  }

  if (user.role === 'doctor') {
    return buildDoctorState(user._id)
  }

  if (user.role === 'patient') {
    return buildPatientState(user._id)
  }

  return null
}

async function buildPublicDoctorList() {
  const doctors = await User.find({ role: 'doctor' }).sort({ createdAt: -1 })
  return doctors.map((doctor) => ({
    id: idOf(doctor._id),
    name: doctor.name || '',
    specialization: doctor.specialization || '',
    treats: splitTreats(doctor.treats).join(', '),
    status: doctor.status || 'Active',
    city: doctor.city || '',
    availability: doctor.availability || '',
  }))
}

module.exports = {
  appointmentDto,
  baseUserDto,
  buildAdminState,
  buildDashboardState,
  buildDoctorState,
  buildPatientState,
  buildPublicDoctorList,
  doctorDto,
  patientDto,
  recordDto,
}
