const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const patientRoutes = require('./routes/patientRoutes')
const publicRoutes = require('./routes/publicRoutes')
const recordRoutes = require('./routes/recordRoutes')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL)
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'MediConnect API' })
})

app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/records', recordRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message || 'Internal Server Error'
  res.status(status).json({ message })
})

module.exports = app
