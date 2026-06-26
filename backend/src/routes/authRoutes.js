const express = require('express')
const { login, me, registerPatient } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/login', login)
router.post('/register/patient', registerPatient)
router.get('/me', protect, me)

module.exports = router
