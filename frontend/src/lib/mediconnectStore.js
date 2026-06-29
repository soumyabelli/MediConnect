function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function splitTreats(value = '') {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getDoctorById(state, doctorId) {
  return state?.doctors?.find((doctor) => doctor.id === doctorId) || null
}

function getPatientById(state, patientId) {
  return state?.patients?.find((patient) => patient.id === patientId) || null
}

function getAppointmentsForDoctor(state, doctorId) {
  return (state?.appointments || []).filter(
    (appointment) => appointment.doctorId === doctorId || appointment.doctor?.id === doctorId,
  )
}

function getAppointmentsForPatient(state, patientId) {
  return (state?.appointments || []).filter(
    (appointment) => appointment.patientId === patientId || appointment.patient?.id === patientId,
  )
}

function getRecordsForDoctor(state, doctorId) {
  return (state?.records || []).filter((record) => record.doctorId === doctorId || record.doctor?.id === doctorId)
}

function getRecordsForPatient(state, patientId) {
  return (state?.records || []).filter((record) => record.patientId === patientId || record.patient?.id === patientId)
}

function parseDate(value) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isSameDay(value, referenceDate) {
  const date = parseDate(value)
  if (!date) {
    return false
  }

  return date.getFullYear() === referenceDate.getFullYear()
    && date.getMonth() === referenceDate.getMonth()
    && date.getDate() === referenceDate.getDate()
}

function isSameMonth(value, referenceDate) {
  const date = parseDate(value)
  if (!date) {
    return false
  }

  return date.getFullYear() === referenceDate.getFullYear()
    && date.getMonth() === referenceDate.getMonth()
}

function getAdminOverview(state) {
  const doctors = state?.doctors || []
  const patients = state?.patients || []
  const appointments = state?.appointments || []
  const records = state?.records || []
  const now = new Date()

  const activeConsultations = appointments.filter((appointment) =>
    ['Confirmed', 'Accepted', 'In Consultation'].includes(appointment.status),
  )
  const pendingRequests = appointments.filter((appointment) => appointment.status === 'Pending')
  const pendingPatientRequests = patients.filter((patient) => patient.status === 'Pending')
  const todaysAppointments = appointments.filter((appointment) =>
    appointment.status !== 'Cancelled' && isSameDay(appointment.appointmentDate, now),
  )
  const monthlyAppointments = appointments.filter((appointment) =>
    appointment.status !== 'Cancelled' && isSameMonth(appointment.appointmentDate, now),
  )
  const monthlyRecords = records.filter((record) => isSameMonth(record.recordDate, now))
  const monthlyPrescriptions = records.filter((record) =>
    String(record.type || '').toLowerCase().includes('prescription') && isSameMonth(record.recordDate, now),
  )
  const newDoctorsThisMonth = doctors.filter((doctor) => isSameMonth(doctor.createdAt, now))
  const newPatientsThisMonth = patients.filter((patient) => isSameMonth(patient.createdAt || patient.registeredAtIso, now))
  const liveConsultations = appointments.filter((appointment) => appointment.status === 'In Consultation')

  return {
    metrics: {
      totalDoctors: doctors.length,
      newDoctorsThisMonth: newDoctorsThisMonth.length,
      totalPatients: patients.length,
      newPatientsThisMonth: newPatientsThisMonth.length,
      todaysAppointments: todaysAppointments.length,
      todaysPendingAppointments: todaysAppointments.filter((appointment) => appointment.status === 'Pending').length,
      activeConsultations: activeConsultations.length,
      liveConsultations: liveConsultations.length,
      totalHealthRecords: records.length,
      recordsThisMonth: monthlyRecords.length,
      prescriptionsGenerated: monthlyPrescriptions.length,
      monthlyConsultations: monthlyAppointments.length,
      pendingAppointmentRequests: pendingRequests.length,
      pendingPatientRequests: pendingPatientRequests.length,
      pendingRequests: pendingRequests.length + pendingPatientRequests.length,
    },
    recentAppointments: appointments.slice(0, 5),
    recentPatients: patients.slice(0, 5).map((patient) => ({
      ...patient,
      doctor: getDoctorById(state, patient.assignedDoctorId),
    })),
    recentDoctors: doctors.slice(0, 5),
    records: records.slice(0, 6),
  }
}

function getDoctorOverview(state, doctorId) {
  const doctor = getDoctorById(state, doctorId)
  const patients = (state?.patients || []).filter((patient) => patient.assignedDoctorId === doctorId)
  const appointments = getAppointmentsForDoctor(state, doctorId)
  const records = getRecordsForDoctor(state, doctorId)

  return {
    doctor,
    metrics: {
      assignedPatients: patients.length,
      upcomingAppointments: appointments.filter((appointment) => appointment.status !== 'Completed' && appointment.status !== 'Cancelled').length,
      treatments: splitTreats(doctor?.treats).length,
      records: records.length,
    },
    patients,
    appointments,
    records,
  }
}

function getPatientOverview(state, patientId) {
  const patient = getPatientById(state, patientId)
  const appointments = getAppointmentsForPatient(state, patientId)
  const records = getRecordsForPatient(state, patientId)

  // Prefer doctor from latest pending/next appointment (works for freshly booked cases)
  const sortedUpcoming = [...appointments].sort((a, b) => {
    const aDate = a?.date ? String(a.date) : ''
    const bDate = b?.date ? String(b.date) : ''
    return aDate < bDate ? 1 : -1
  })

  const latestAppointment = sortedUpcoming.find((a) => a?.doctor?.id) || sortedUpcoming.find((a) => a?.doctor) || null
  const doctorFromLatestAppointment = latestAppointment?.doctor || null
  const doctor = doctorFromLatestAppointment || (patient ? getDoctorById(state, patient.assignedDoctorId) : null)

  return {
    patient,
    doctor,
    metrics: {
      appointments: appointments.length,
      records: records.length,
      medications: records.length,
      pendingAppointments: appointments.filter((appointment) => appointment.status === 'Pending').length,
    },
    appointments,
    records,
  }
}

export {
  getAdminOverview,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  getDoctorById,
  getDoctorOverview,
  getPatientById,
  getPatientOverview,
  getRecordsForDoctor,
  getRecordsForPatient,
  normalizeEmail,
  splitTreats,
}

