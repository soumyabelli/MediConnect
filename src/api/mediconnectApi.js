import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

function readApiError(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.message || error?.message || fallback
}

async function fetchPublicDoctors() {
  const { data } = await api.get('/public/doctors')
  return data
}

async function fetchAppointmentAvailability(token, doctorId, appointmentDate) {
  const { data } = await api.get('/appointments/availability', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      doctorId,
      appointmentDate,
    },
  })

  return data
}

async function fetchAppointmentById(token, appointmentId) {
  const { data } = await api.get(`/appointments/${appointmentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return data
}

async function login({ role, email, password }) {
  const { data } = await api.post('/auth/login', { role, email, password })
  return data
}

async function registerPatient(payload) {
  const { data } = await api.post('/auth/register/patient', payload)
  return data
}

async function fetchDashboard(token) {
  const { data } = await api.get('/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

async function createDoctor(token, payload) {
  const { data } = await api.post('/admin/doctors', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

async function createRecord(token, payload) {
  const { data } = await api.post('/records', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

async function updateAppointmentStatus(token, appointmentId, payload) {
  const { data } = await api.patch(`/appointments/${appointmentId}/status`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

async function updatePatientProfile(token, payload) {
  const { data } = await api.put('/patients/me', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}

export {
  api,
  createDoctor,
  createRecord,
  fetchAppointmentAvailability,
  fetchAppointmentById,
  fetchDashboard,
  fetchPublicDoctors,
  login,
  readApiError,
  registerPatient,
  updateAppointmentStatus,
  updatePatientProfile,
}
