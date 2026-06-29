const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { isConnected } = require('../config/db')

function protect(req, res, next) {
  if (!isConnected()) {
    return res.status(503).json({ message: 'Service temporarily unavailable: database not connected.' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''


  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = payload

    User.findById(payload.sub)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found.' })
        }

        req.user = user
        return next()
      })
      .catch(next)
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token.' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized.' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource.' })
    }

    return next()
  }
}

module.exports = {
  protect,
  requireRole,
}
