const express = require('express')
const { getPublicDoctors } = require('../controllers/dashboardController')

const router = express.Router()

router.get('/doctors', getPublicDoctors)

module.exports = router
