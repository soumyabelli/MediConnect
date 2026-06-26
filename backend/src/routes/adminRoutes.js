const express = require('express')
const { createDoctor } = require('../controllers/adminController')
const { protect, requireRole } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/doctors', protect, requireRole('admin'), createDoctor)

module.exports = router
