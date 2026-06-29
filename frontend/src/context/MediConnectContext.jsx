/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import {
  createDoctor as createDoctorRequest,
  fetchDashboard,
  fetchPublicDoctors,
  login as loginRequest,
  readApiError,
  registerPatient as registerPatientRequest,
} from '../api/mediconnectApi'
import { loadPortalCache, loadSession, savePortalCache, saveSession, clearSession } from '../lib/authStorage'

const EMPTY_DASHBOARD = {
  admin: null,
  doctors: [],
  patients: [],
  appointments: [],
  records: [],
}

const emptyPortalCache = {
  dashboard: EMPTY_DASHBOARD,
  publicDoctors: [],
}

const MediConnectContext = createContext(null)

function normalizeDashboard(dashboard) {
  return {
    admin: dashboard?.admin || null,
    doctors: Array.isArray(dashboard?.doctors) ? dashboard.doctors : [],
    patients: Array.isArray(dashboard?.patients) ? dashboard.patients : [],
    appointments: Array.isArray(dashboard?.appointments) ? dashboard.appointments : [],
    records: Array.isArray(dashboard?.records) ? dashboard.records : [],
  }
}

function normalizePublicDoctors(publicDoctors) {
  return Array.isArray(publicDoctors) ? publicDoctors : []
}

function loadInitialPortalData() {
  const cache = loadPortalCache() || emptyPortalCache

  return {
    dashboard: normalizeDashboard(cache.dashboard),
    publicDoctors: normalizePublicDoctors(cache.publicDoctors),
  }
}

function buildSessionFromResponse(response) {
  if (!response?.token || !response?.user) {
    return null
  }

  return {
    token: response.token,
    role: response.user.role,
    userId: response.user.id,
    email: response.user.email,
    name: response.user.name,
  }
}

function buildSuccessResponse(response, fallbackMessage) {
  return {
    ok: true,
    message: fallbackMessage,
    ...response,
  }
}

export function MediConnectProvider({ children }) {
  const [initialPortalData] = useState(() => loadInitialPortalData())
  const [state, setState] = useState(initialPortalData.dashboard)
  const [publicDoctors, setPublicDoctors] = useState(initialPortalData.publicDoctors)
  const [session, setSession] = useState(() => loadSession())
  const [bootstrapping, setBootstrapping] = useState(true)
  const socketRef = useRef(null)
  const dashboardRef = useRef(initialPortalData.dashboard)

  useEffect(() => {
    dashboardRef.current = state
  }, [state])

  const persistPortalData = useCallback((dashboard, doctorsList) => {
    savePortalCache({
      dashboard: normalizeDashboard(dashboard),
      publicDoctors: normalizePublicDoctors(doctorsList),
    })
  }, [])

  const refreshPublicDoctors = useCallback(async () => {
    try {
      const response = await fetchPublicDoctors()
      const nextDoctors = normalizePublicDoctors(response?.doctors)
      setPublicDoctors(nextDoctors)
      persistPortalData(dashboardRef.current, nextDoctors)
      return nextDoctors
    } catch (error) {
      return {
        ok: false,
        message: readApiError(error, 'Unable to refresh the doctor list right now.'),
      }
    }
  }, [persistPortalData])

  const syncDashboard = useCallback(async (token) => {
    try {
      const response = await fetchDashboard(token)
      const nextSession = buildSessionFromResponse(response)
      const nextDashboard = normalizeDashboard(response?.dashboard)

      if (nextSession) {
        setSession(nextSession)
        saveSession(nextSession)
      }

      setState(nextDashboard)
      persistPortalData(nextDashboard, publicDoctors)

      return { ok: true, dashboard: nextDashboard, user: response?.user || null }
    } catch (error) {
      if (error?.response?.status === 401) {
        clearSession()
        setSession(null)
        setState(EMPTY_DASHBOARD)
        persistPortalData(EMPTY_DASHBOARD, publicDoctors)
      }

      return {
        ok: false,
        message: readApiError(error, 'Unable to load the dashboard right now.'),
      }
    }
  }, [persistPortalData, publicDoctors])

  useEffect(() => {
    if (!session?.token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return undefined
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: session.token },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      socket.emit('join-user', { userId: session.userId })
    })

    const handleSync = () => {
      syncDashboard(session.token)
      refreshPublicDoctors()
    }

    socket.on('dashboard:updated', handleSync)
    socket.on('appointment:updated', handleSync)
    socket.on('record:created', handleSync)

    socketRef.current = socket

    return () => {
      socket.off('dashboard:updated', handleSync)
      socket.off('appointment:updated', handleSync)
      socket.off('record:created', handleSync)
      socket.disconnect()
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [session?.token, session?.userId, refreshPublicDoctors, syncDashboard])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const cached = loadInitialPortalData()
      const storedSession = loadSession()

      if (!active) {
        return
      }

      setState(cached.dashboard)
      setPublicDoctors(cached.publicDoctors)
      setSession(storedSession)

      try {
        const [publicResponse, dashboardResponse] = await Promise.all([
          fetchPublicDoctors().catch((error) => ({ error })),
          storedSession?.token
            ? fetchDashboard(storedSession.token).catch((error) => ({ error }))
            : Promise.resolve(null),
        ])

        if (!active) {
          return
        }

        let nextDashboard = cached.dashboard
        let nextDoctors = cached.publicDoctors

        if (publicResponse && !publicResponse.error) {
          nextDoctors = normalizePublicDoctors(publicResponse.doctors)
          setPublicDoctors(nextDoctors)
        }

        if (dashboardResponse && !dashboardResponse.error) {
          const nextSession = buildSessionFromResponse(dashboardResponse)
          nextDashboard = normalizeDashboard(dashboardResponse.dashboard)

          if (nextSession) {
            setSession(nextSession)
            saveSession(nextSession)
          }

          setState(nextDashboard)
        } else if (dashboardResponse?.error?.response?.status === 401) {
          clearSession()
          setSession(null)
          nextDashboard = EMPTY_DASHBOARD
          setState(nextDashboard)
        }

        persistPortalData(nextDashboard, nextDoctors)
      } finally {
        if (active) {
          setBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  const login = async ({ role, email, password }) => {
    try {
      const response = await loginRequest({ role, email, password })
      const nextSession = buildSessionFromResponse(response)
      const nextDashboard = normalizeDashboard(response?.dashboard)

      if (nextSession) {
        setSession(nextSession)
        saveSession(nextSession)
      }

      setState(nextDashboard)
      persistPortalData(nextDashboard, publicDoctors)

      return buildSuccessResponse(response, `Signed in as ${response?.user?.name || 'your account'}.`)
    } catch (error) {
      return {
        ok: false,
        message: readApiError(error, 'Unable to sign in right now.'),
      }
    }
  }

  const registerPatient = async (payload) => {
    try {
      const response = await registerPatientRequest(payload)
      const nextSession = buildSessionFromResponse(response)
      const nextDashboard = normalizeDashboard(response?.dashboard)

      if (nextSession) {
        setSession(nextSession)
        saveSession(nextSession)
      }

      setState(nextDashboard)
      persistPortalData(nextDashboard, publicDoctors)

      return {
        ...buildSuccessResponse(response, `Created ${response?.user?.name || 'patient'} account.`),
        patient: response?.user || null,
      }
    } catch (error) {
      return {
        ok: false,
        message: readApiError(error, 'Unable to create the patient account right now.'),
      }
    }
  }

  const createDoctor = async (payload) => {
    if (!session?.token) {
      return {
        ok: false,
        message: 'Your admin session expired. Please sign in again.',
      }
    }

    try {
      const response = await createDoctorRequest(session.token, payload)
      const nextDashboard = normalizeDashboard(response?.dashboard)
      setState(nextDashboard)

      const refreshedDoctors = await fetchPublicDoctors()
        .then((result) => normalizePublicDoctors(result?.doctors))
        .catch(() => publicDoctors)

      setPublicDoctors(refreshedDoctors)
      persistPortalData(nextDashboard, refreshedDoctors)

      return buildSuccessResponse(response, `Created ${response?.doctor?.name || 'doctor'} account.`)
    } catch (error) {
      return {
        ok: false,
        message: readApiError(error, 'Unable to create the doctor right now.'),
      }
    }
  }

  const logout = () => {
    clearSession()
    setSession(null)
    setState(EMPTY_DASHBOARD)
    persistPortalData(EMPTY_DASHBOARD, publicDoctors)

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  const value = {
    bootstrapping,
    createDoctor,
    login,
    logout,
    publicDoctors,
    refreshPublicDoctors,
    registerPatient,
    session,
    state,
    syncDashboard,
  }

  return <MediConnectContext.Provider value={value}>{children}</MediConnectContext.Provider>
}

export function useMediConnect() {
  const context = useContext(MediConnectContext)

  if (!context) {
    throw new Error('useMediConnect must be used within a MediConnectProvider')
  }

  return context
}
