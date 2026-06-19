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

export {
  api,
  createDoctor,
  fetchDashboard,
  fetchPublicDoctors,
  login,
  readApiError,
  registerPatient,
}
