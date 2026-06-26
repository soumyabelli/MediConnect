const User = require('../models/User')
const { isConnected } = require('../config/db')
const { emitDashboardUpdate } = require('../utils/realtime')

function sanitizeText(value) {
  return String(value || '').trim()
}

async function updateMe(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patient accounts can update this profile.' })
    }

    const {
      name,
      phone,
      age,
      gender,
      condition,
      bloodGroup,
      address,
      notes,
    } = req.body || {}

    const updates = {}

    if (name !== undefined) updates.name = sanitizeText(name)
    if (phone !== undefined) updates.phone = sanitizeText(phone)
    if (age !== undefined) updates.age = sanitizeText(age)
    if (gender !== undefined) updates.gender = sanitizeText(gender)
    if (condition !== undefined) updates.condition = sanitizeText(condition)
    if (bloodGroup !== undefined) updates.bloodGroup = sanitizeText(bloodGroup)
    if (address !== undefined) updates.address = sanitizeText(address)
    if (notes !== undefined) updates.notes = sanitizeText(notes)

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })

    emitDashboardUpdate(updatedUser._id, { reason: 'patient-profile-updated' })

    return res.json({
      user: {
        id: String(updatedUser._id),
        role: updatedUser.role,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        age: updatedUser.age,
        gender: updatedUser.gender,
        condition: updatedUser.condition,
        bloodGroup: updatedUser.bloodGroup,
        address: updatedUser.address,
        notes: updatedUser.notes,
      },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  updateMe,
}
