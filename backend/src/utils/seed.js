const User = require('../models/User')
const Appointment = require('../models/Appointment')
const Record = require('../models/Record')
const { hashPassword } = require('./password')

function pickDoctorForCondition(doctors, condition = '', preferredDoctorId = '') {
  if (preferredDoctorId) {
    const preferred = doctors.find((doctor) => String(doctor._id) === String(preferredDoctorId))
    if (preferred) {
      return preferred
    }
  }

  const needle = String(condition).trim().toLowerCase()
  if (!needle) {
    return doctors[0] || null
  }

  const keywordMatch = doctors.find((doctor) =>
    (doctor.treats || []).some((keyword) => {
      const normalized = String(keyword).toLowerCase()
      return normalized.includes(needle) || needle.includes(normalized)
    }),
  )

  return keywordMatch || doctors[0] || null
}

async function createSeedUsers() {
  const adminPassword = await hashPassword('123')
  const doctorPasswords = await Promise.all(['priya123', 'amit123', 'neha123'].map((password) => hashPassword(password)))

  const [admin] = await User.create([
    {
      role: 'admin',
      name: 'Admin',
      title: 'Super Admin',
      email: 'admin@gmail.com',
      phone: '+91 90000 00001',
      passwordHash: adminPassword,
    },
  ])

  const doctors = await User.insertMany([
    {
      role: 'doctor',
      name: 'Dr. Priya Patel',
      email: 'priya.patel@mediconnect.com',
      phone: '+91 98765 43211',
      passwordHash: doctorPasswords[0],
      specialization: 'Cardiologist',
      treats: ['Cardiology', 'Blood Pressure', 'Heart Care'],
      availability: 'Mon, Wed, Fri',
      status: 'Active',
      fee: 'INR 900',
      experience: '12 years',
      city: 'Ahmedabad',
      bio: 'Guided cardiac follow-ups, medication reviews, and recovery plans.',
    },
    {
      role: 'doctor',
      name: 'Dr. Amit Singh',
      email: 'amit.singh@mediconnect.com',
      phone: '+91 98765 43212',
      passwordHash: doctorPasswords[1],
      specialization: 'Neurologist',
      treats: ['Neurology', 'Migraine', 'Nerve Care'],
      availability: 'Tue, Thu, Sat',
      status: 'Active',
      fee: 'INR 850',
      experience: '9 years',
      city: 'Delhi',
      bio: 'Handles headache workups, nerve health, and long-term follow-up.',
    },
    {
      role: 'doctor',
      name: 'Dr. Neha Gupta',
      email: 'neha.gupta@mediconnect.com',
      phone: '+91 98765 43213',
      passwordHash: doctorPasswords[2],
      specialization: 'Pediatrician',
      treats: ['Pediatrics', 'Child Health', 'Vaccination'],
      availability: 'Mon-Fri',
      status: 'On Leave',
      fee: 'INR 700',
      experience: '8 years',
      city: 'Jaipur',
      bio: 'Supports child check-ups, vaccination follow-up, and wellness plans.',
    },
  ])

  const doctorBySpecialty = {
    Cardiology: doctors[0],
    Migraine: doctors[1],
    Pediatrics: doctors[2],
  }

  const patients = await User.insertMany([
    {
      role: 'patient',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@mediconnect.com',
      phone: '+91 98765 00101',
      passwordHash: await hashPassword('rahul123'),
      age: '28',
      gender: 'Male',
      condition: 'Cardiology',
      assignedDoctorId: doctorBySpecialty.Cardiology._id,
      status: 'Active',
      bloodGroup: 'O+',
      address: 'Ahmedabad',
      notes: 'Prefers evening follow-ups.',
      registeredAt: new Date('2025-05-18T12:00:00.000Z'),
      lastVisitAt: new Date('2025-05-19T12:00:00.000Z'),
    },
    {
      role: 'patient',
      name: 'Anjali Verma',
      email: 'anjali.verma@mediconnect.com',
      phone: '+91 98765 00102',
      passwordHash: await hashPassword('anjali123'),
      age: '34',
      gender: 'Female',
      condition: 'Migraine',
      assignedDoctorId: doctorBySpecialty.Migraine._id,
      status: 'Active',
      bloodGroup: 'A+',
      address: 'New Delhi',
      notes: 'Track headache triggers.',
      registeredAt: new Date('2025-05-17T12:00:00.000Z'),
      lastVisitAt: new Date('2025-05-18T12:00:00.000Z'),
    },
    {
      role: 'patient',
      name: 'Sneha ',
      email: 'sneha.iyer@mediconnect.com',
      phone: '+91 98765 00103',
      passwordHash: await hashPassword('sneha123'),
      age: '29',
      gender: 'Female',
      condition: 'Pediatrics',
      assignedDoctorId: doctorBySpecialty.Pediatrics._id,
      status: 'Pending',
      bloodGroup: 'B+',
      address: 'Jaipur',
      notes: 'New patient registration.',
      registeredAt: new Date('2025-05-16T12:00:00.000Z'),
      lastVisitAt: new Date('2025-05-16T12:00:00.000Z'),
    },
  ])

  const patientByEmail = Object.fromEntries(patients.map((patient) => [patient.email, patient]))

  await Appointment.insertMany([
    {
      patient: patientByEmail['rahul.sharma@mediconnect.com']._id,
      doctor: doctorBySpecialty.Cardiology._id,
      appointmentDate: new Date('2025-05-20T12:00:00.000Z'),
      timeLabel: '10:00 AM',
      status: 'Confirmed',
      mode: 'Online',
      reason: 'Cardiology follow-up',
    },
    {
      patient: patientByEmail['anjali.verma@mediconnect.com']._id,
      doctor: doctorBySpecialty.Migraine._id,
      appointmentDate: new Date('2025-05-20T12:00:00.000Z'),
      timeLabel: '11:30 AM',
      status: 'Pending',
      mode: 'Online',
      reason: 'Migraine review',
    },
    {
      patient: patientByEmail['sneha.iyer@mediconnect.com']._id,
      doctor: doctorBySpecialty.Pediatrics._id,
      appointmentDate: new Date('2025-05-21T12:00:00.000Z'),
      timeLabel: '02:30 PM',
      status: 'Completed',
      mode: 'In Clinic',
      reason: 'Vaccination follow-up',
    },
    {
      patient: patientByEmail['rahul.sharma@mediconnect.com']._id,
      doctor: doctorBySpecialty.Cardiology._id,
      appointmentDate: new Date('2025-05-22T12:00:00.000Z'),
      timeLabel: '04:00 PM',
      status: 'Cancelled',
      mode: 'Online mode',
      reason: 'General check',
    },
  ])

  await Record.insertMany([
    {
      patient: patientByEmail['rahul.sharma@mediconnect.com']._id,
      doctor: doctorBySpecialty.Cardiology._id,
      recordDate: new Date('2025-05-19T12:00:00.000Z'),
      title: 'ECG follow-up',
      summary: 'Stable after medication review with good blood pressure control.',
      prescription: 'Amlodipine 5mg',
      type: 'Cardiology',
    },
    {
      patient: patientByEmail['anjali.verma@mediconnect.com']._id,
      doctor: doctorBySpecialty.Migraine._id,
      recordDate: new Date('2025-05-18T12:00:00.000Z'),
      title: 'Migraine review',
      summary: 'Symptoms reduced, keep trigged logged and follow the plan.',
      prescription: 'Rizatriptan as needed',
      type: 'Neurology',
    },
    {
      patient: patientByEmail['sneha.iyer@mediconnect.com']._id,
      doctor: doctorBySpecialty.Pediatrics._id,
      recordDate: new Date('2025-05-16T12:00:00.000Z'),
      title: 'Pediatric check',
      summary: 'Vaccines updated and growth tracking is within range.',
      prescription: 'Vitamin D drops',
      type: 'Pediatrics',
    },
  ])

  return { admin, doctors, patients }
}

async function seedInitialData() {
  const [adminCount, doctorCount, patientCount, appointmentCount, recordCount] = await Promise.all([
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' }),
    Appointment.countDocuments(),
    Record.countDocuments(),
  ])

  if (adminCount > 0 || doctorCount > 0 || patientCount > 0 || appointmentCount > 0 || recordCount > 0) {
    return { seeded: false }
  }

  await createSeedUsers()
  return { seeded: true }
}

module.exports = {
  pickDoctorForCondition,
  seedInitialData,
}
