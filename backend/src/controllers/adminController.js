const User = require('../models/User')
const { hashPassword } = require('../utils/password')
const { buildDashboardState, baseUserDto } = require('../utils/stateBuilder')
//create doctor
async function createDoctor(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      treats,
      availability,
      fee,
      experience,
      city,
      bio,
      status = 'Active',
    } = req.body

    if (!name || !email || !password || !phone || !specialization || !treats || !availability || !fee || !experience || !city || !bio) {
      return res.status(400).json({ message: 'Please complete all doctor fields.' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ message: 'This email already exists. Use a different email.' })
    }

    const passwordHash = await hashPassword(password)
    const doctor = await User.create({
      role: 'doctor',
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      specialization,
      treats: String(treats)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      availability,
      fee,
      experience,
      city,
      bio,
      status,
    })

    const dashboard = await buildDashboardState(req.user)

    return res.status(201).json({
      doctor: baseUserDto(doctor),
      temporaryPassword: password,
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createDoctor,
}
