const express = require('express')
const { protect, requireRole } = require('../middleware/authMiddleware')
const { createRecord } = require('../controllers/recordController')

const router = express.Router()

router.post('/', protect, requireRole('doctor'), createRecord)

module.exports = router
