const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let ioInstance = null

function setIO(io) {
  ioInstance = io
}

function getIO() {
  return ioInstance
}

function emitDashboardUpdate(userId, payload = {}) {
  if (!ioInstance || !userId) {
    return
  }

  ioInstance.to(`user:${String(userId)}`).emit('dashboard:updated', payload)
}

function emitAppointmentUpdate(appointment, payload = {}) {
  if (!ioInstance || !appointment) {
    return
  }

  const patientId = appointment.patient?._id || appointment.patientId || appointment.patient
  const doctorId = appointment.doctor?._id || appointment.doctorId || appointment.doctor

  ioInstance.to(`appointment:${String(appointment._id || appointment.id)}`).emit('appointment:updated', payload)
  if (patientId) {
    ioInstance.to(`user:${String(patientId)}`).emit('appointment:updated', payload)
  }
  if (doctorId) {
    ioInstance.to(`user:${String(doctorId)}`).emit('appointment:updated', payload)
  }
}

function emitRecordUpdate(record, payload = {}) {
  if (!ioInstance || !record) {
    return
  }

  const patientId = record.patient?._id || record.patientId || record.patient
  const doctorId = record.doctor?._id || record.doctorId || record.doctor

  if (patientId) {
    ioInstance.to(`user:${String(patientId)}`).emit('record:created', payload)
  }
  if (doctorId) {
    ioInstance.to(`user:${String(doctorId)}`).emit('record:created', payload)
  }
  ioInstance.to(`record:${String(record._id || record.id)}`).emit('record:created', payload)
}

function setupRealtime(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
      ],
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') || ''
      if (!token) {
        return next(new Error('Authentication token missing'))
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.data.user = {
        id: String(payload.sub),
        role: payload.role,
        email: payload.email,
      }
      return next()
    } catch (error) {
      return next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    if (user?.id) {
      socket.join(`user:${user.id}`)
    }

    socket.on('join-consultation', ({ appointmentId } = {}, ack = () => {}) => {
      if (!appointmentId) {
        ack({ ok: false, message: 'appointmentId is required.' })
        return
      }

      socket.join(`appointment:${String(appointmentId)}`)
      socket.to(`appointment:${String(appointmentId)}`).emit('consultation:peer-joined', { appointmentId, user })
      ack({ ok: true })
    })

    socket.on('leave-consultation', ({ appointmentId } = {}) => {
      if (!appointmentId) return
      socket.leave(`appointment:${String(appointmentId)}`)
      socket.to(`appointment:${String(appointmentId)}`).emit('consultation:peer-left', { appointmentId, user })
    })

    socket.on('consultation:signal', ({ appointmentId, type, data } = {}) => {
      if (!appointmentId || !type) return
      socket.to(`appointment:${String(appointmentId)}`).emit('consultation:signal', {
        appointmentId: String(appointmentId),
        type,
        data,
        from: user,
      })
    })

    socket.on('disconnect', () => {
      // Socket.IO cleans up room membership automatically.
    })
  })

  setIO(io)
  return io
}

module.exports = {
  emitAppointmentUpdate,
  emitDashboardUpdate,
  emitRecordUpdate,
  getIO,
  setIO,
  setupRealtime,
}



