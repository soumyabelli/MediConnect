const express = require('express')
const { protect, requireRole } = require('../middleware/authMiddleware')
const { updateMe } = require('../controllers/patientController')

const router = express.Router()

router.get('/me', protect, requireRole('patient'), (req, res) => {
  return res.status(405).json({ message: 'Use the dashboard endpoint for profile details.' })
})
router.put('/me', protect, requireRole('patient'), updateMe)

module.exports = router
