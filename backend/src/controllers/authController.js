const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const { comparePassword, hashPassword } = require('../utils/password')
const {
  buildDashboardState,
  baseUserDto,
  buildPublicDoctorList,
  doctorDto,
  patientDto,
} = require('../utils/stateBuilder')
const { pickDoctorForCondition } = require('../utils/seed')
const { isConnected } = require('../config/db')
const { emitDashboardUpdate } = require('../utils/realtime')


function createToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function sanitizeText(value) {
  return String(value || '').trim()
}

function normalizeEmail(email) {
  return sanitizeText(email).toLowerCase()
}

function normalizeTreats(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeText(item)).filter(Boolean)
  }

  return String(value || '')
    .split(',')
    .map((item) => sanitizeText(item))
    .filter(Boolean)
}

function profileDto(user) {
  if (!user) {
    return null
  }

  if (user.role === 'doctor') {
    return doctorDto(user)
  }

  if (user.role === 'patient') {
    return patientDto(user)
  }

  return baseUserDto(user)
}

async function getUserForLogin(role, email) {
  const normalizedEmail = normalizeEmail(email)
  const query = { email: normalizedEmail }
  if (role) query.role = role
  return User.findOne(query).select('+passwordHash')
}

async function login(req, res, next) {
  try {
    const { role: rawRole, email, password } = req.body
    const role = rawRole ? String(rawRole).trim().toLowerCase() : ''

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    if (role && !['admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Role must be one of: admin, doctor, patient.' })
    }

    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const user = await getUserForLogin(role, email)

    if (!user) {
      return res.status(401).json({ message: 'No matching account was found.' })
    }

    const passwordMatches = await comparePassword(password, user.passwordHash)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'No matching account was found.' })
    }

    const token = createToken(user)
    const dashboard = await buildDashboardState(user)

    return res.json({
      token,
      user: baseUserDto(user),
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

async function registerPatient(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const {

      name,
      email,
      password,
      phone,
      age,
      gender,
      condition,
      bloodGroup,
      address,
      notes = '',
      preferredDoctorId = '',
    } = req.body

    if (!name || !email || !password || !phone || !age || !gender || !condition || !bloodGroup || !address) {
      return res.status(400).json({ message: 'Please complete all required patient fields.' })
    }

    const normalizedEmail = normalizeEmail(email)
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ message: 'This email already exists. Use a different email.' })
    }

    const doctors = await User.find({ role: 'doctor' }).sort({ createdAt: -1 })
    const selectedDoctor = pickDoctorForCondition(doctors, condition, preferredDoctorId)

    const passwordHash = await hashPassword(password)
    const patient = await User.create({
      role: 'patient',
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      age,
      gender,
      condition,
      bloodGroup,
      address,
      notes,
      assignedDoctorId: selectedDoctor ? selectedDoctor._id : null,
      status: 'Active',
      registeredAt: new Date(),
      lastVisitAt: null,
    })

    const token = createToken(patient)
    const dashboard = await buildDashboardState(patient)

    return res.status(201).json({
      token,
      user: baseUserDto(patient),
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

async function me(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const dashboard = await buildDashboardState(req.user)

    return res.json({
      user: baseUserDto(req.user),
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

async function updateProfile(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const user = await User.findById(req.user._id).select('+passwordHash')
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const {
      name,
      email,
      phone,
      password,
      title,
      specialization,
      treats,
      availability,
      fee,
      experience,
      city,
      bio,
      age,
      gender,
      condition,
      bloodGroup,
      address,
      notes,
    } = req.body || {}

    if (name !== undefined) user.name = sanitizeText(name)
    if (phone !== undefined) user.phone = sanitizeText(phone)

    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email)
      if (!normalizedEmail) {
        return res.status(400).json({ message: 'Email cannot be empty.' })
      }

      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      }).select('_id')

      if (existing) {
        return res.status(409).json({ message: 'This email already exists. Use a different email.' })
      }

      user.email = normalizedEmail
    }

    if (password !== undefined) {
      const nextPassword = String(password || '').trim()
      if (nextPassword && nextPassword.length < 3) {
        return res.status(400).json({ message: 'Password must be at least 3 characters long.' })
      }

      if (nextPassword) {
        user.passwordHash = await hashPassword(nextPassword)
      }
    }

    if (user.role === 'admin') {
      if (title !== undefined) user.title = sanitizeText(title)
    }

    if (user.role === 'doctor') {
      if (specialization !== undefined) user.specialization = sanitizeText(specialization)
      if (treats !== undefined) user.treats = normalizeTreats(treats)
      if (availability !== undefined) user.availability = sanitizeText(availability)
      if (fee !== undefined) user.fee = sanitizeText(fee)
      if (experience !== undefined) user.experience = sanitizeText(experience)
      if (city !== undefined) user.city = sanitizeText(city)
      if (bio !== undefined) user.bio = sanitizeText(bio)
    }

    if (user.role === 'patient') {
      if (age !== undefined) user.age = sanitizeText(age)
      if (gender !== undefined) user.gender = sanitizeText(gender)
      if (condition !== undefined) user.condition = sanitizeText(condition)
      if (bloodGroup !== undefined) user.bloodGroup = sanitizeText(bloodGroup)
      if (address !== undefined) user.address = sanitizeText(address)
      if (notes !== undefined) user.notes = sanitizeText(notes)
    }

    await user.save()

    const token = createToken(user)
    const dashboard = await buildDashboardState(user)

    emitDashboardUpdate(user._id, { reason: `${user.role}-profile-updated` })

    return res.json({
      message: 'Profile updated successfully.',
      token,
      user: profileDto(user),
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

async function publicDoctors(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const doctors = await buildPublicDoctorList()

    return res.json({ doctors })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  login,
  me,
  publicDoctors,
  registerPatient,
  updateProfile,
}
