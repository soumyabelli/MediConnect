const express = require('express')
const { login, me, registerPatient, updateProfile } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/login', login)
router.post('/register/patient', registerPatient)
router.get('/me', protect, me)
router.put('/profile', protect, updateProfile)

module.exports = router
