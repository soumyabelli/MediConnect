const { buildDashboardState, buildPublicDoctorList } = require('../utils/stateBuilder')
const { isConnected } = require('../config/db')


async function getDashboard(req, res, next) {
  try {
    if (!isConnected()) {
      return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
    }

    const dashboard = await buildDashboardState(req.user)

    return res.json({
      user: {
        id: String(req.user._id),
        role: req.user.role,
        name: req.user.name,
        email: req.user.email,
      },
      dashboard,
    })
  } catch (error) {
    return next(error)
  }
}

async function getPublicDoctors(req, res, next) {
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
  getDashboard,
  getPublicDoctors,
}
