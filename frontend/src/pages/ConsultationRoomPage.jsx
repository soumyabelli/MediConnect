import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { FiArrowLeft, FiCamera, FiCameraOff, FiMic, FiMicOff, FiPhoneOff, FiVideo } from 'react-icons/fi'
import { useMediConnect } from '../context/MediConnectContext'
import { fetchAppointmentById, readApiError } from '../api/mediconnectApi'
import { EmptyState, Panel, SectionHeader } from '../components/dashboard/PortalPrimitives'

function getFriendlyError(error, fallback) {
  return readApiError(error, fallback)
}

function isCallReady(status = '') {
  return ['Confirmed', 'Accepted', 'In Consultation', 'Completed'].includes(status)
}


export default function ConsultationRoomPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { session, state, syncDashboard } = useMediConnect()

  const [appointment, setAppointment] = useState(() => state.appointments.find((item) => String(item.id) === String(appointmentId)) || null)
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [peerJoined, setPeerJoined] = useState(false)
  const [callState, setCallState] = useState('Idle')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('Camera not started yet.')
  const [micEnabled, setMicEnabled] = useState(true)
  const [camEnabled, setCamEnabled] = useState(true)
  const [mediaReady, setMediaReady] = useState(false)

  const socketRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const joinedRef = useRef(false)
  const isOffererRef = useRef(false)
  const remoteDescriptionReadyRef = useRef(false)
  const pendingIceRef = useRef([])

  const startOffer = useCallback(async () => {
    if (!socketRef.current || !pcRef.current || !joinedRef.current || session.role !== 'doctor') {
      return
    }

    if (isOffererRef.current) {
      return
    }

    isOffererRef.current = true
    const pc = pcRef.current
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current.emit('consultation:signal', { appointmentId, type: 'offer', data: offer })
    setCallState('Calling')
  }, [appointmentId, session.role])

  const appointmentFromStore = useMemo(
    () => state.appointments.find((item) => String(item.id) === String(appointmentId)) || null,
    [appointmentId, state.appointments],
  )

  useEffect(() => {
    let active = true

    async function loadAppointment() {
      if (!session?.token || !appointmentId) {
        return
      }

      if (appointmentFromStore) {
        setAppointment(appointmentFromStore)
        return
      }

      try {
        setLoading(true)
        const response = await fetchAppointmentById(session.token, appointmentId)
        if (active) {
          setAppointment(response?.appointment || null)
        }
      } catch (requestError) {
        if (active) {
          setError(getFriendlyError(requestError, 'Unable to load this consultation room.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAppointment()

    return () => {
      active = false
    }
  }, [appointmentFromStore, appointmentId, session?.token])

  useEffect(() => {
    if (!session?.token) {
      return undefined
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: session.token },
      transports: ['websocket'],
    })

    socket.on('connect_error', (err) => {
      console.warn('Consultation socket connection error:', err.message)
      if (err.message === 'Authentication failed' || err.message === 'Authentication token missing') {
        socket.disconnect()
      }
    })

    socketRef.current = socket

    const flushPendingIce = async (pc) => {
      while (pendingIceRef.current.length) {
        const candidate = pendingIceRef.current.shift()
        if (!candidate) continue
        try {
          await pc.addIceCandidate(candidate)
        } catch {
          // Ignore transient ICE issues.
        }
      }
    }

    socket.on('consultation:peer-joined', async () => {
      setPeerJoined(true)
      setInfo('The other participant joined the room.')
      if (session.role === 'doctor' && joinedRef.current) {
        await startOffer()
      }
    })

    socket.on('consultation:peer-left', () => {
      setPeerJoined(false)
      setInfo('The other participant left the room.')
    })

    socket.on('consultation:signal', async ({ type, data } = {}) => {
      const pc = pcRef.current
      if (!pc || !type || !data) {
        return
      }

      if (type === 'offer') {
        isOffererRef.current = false
        await pc.setRemoteDescription(data)
        remoteDescriptionReadyRef.current = true
        await flushPendingIce(pc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('consultation:signal', { appointmentId, type: 'answer', data: answer })
        setCallState('Connecting')
        return
      }

      if (type === 'answer') {
        await pc.setRemoteDescription(data)
        remoteDescriptionReadyRef.current = true
        await flushPendingIce(pc)
        setCallState('Connected')
        return
      }

      if (type === 'ice') {
        if (remoteDescriptionReadyRef.current) {
          try {
            await pc.addIceCandidate(data)
          } catch {
            // Ignore transient ICE issues.
          }
        } else {
          pendingIceRef.current.push(data)
        }
      }
    })

    return () => {
      socket.disconnect()
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [appointmentId, session?.role, session?.token, startOffer])

  function createPeerConnection() {
    if (pcRef.current) {
      return pcRef.current
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('consultation:signal', {
          appointmentId,
          type: 'ice',
          data: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
      }
    }

    pc.onconnectionstatechange = () => {
      setCallState(pc.connectionState === 'connected' ? 'Connected' : pc.connectionState)
    }

    pcRef.current = pc
    return pc
  }

  async function ensureMedia() {
    if (localStreamRef.current) {
      return localStreamRef.current
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    localStreamRef.current = stream

    const pc = createPeerConnection()
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }

    setMicEnabled(true)
    setCamEnabled(true)
    setMediaReady(true)
    setInfo('Camera and microphone are ready.')
    return stream
  }

  const joinRoom = useCallback(async () => {
    if (!session?.token) {
      setError('Please sign in again to join the consultation room.')
      return
    }

    if (!appointment) {
      setError('Appointment details are not loaded yet.')
      return
    }

    try {
      setError('')
      setLoading(true)
      await ensureMedia()
      socketRef.current?.emit('join-consultation', { appointmentId }, (response) => {
        if (!response?.ok) {
          setError(response?.message || 'Unable to join the consultation room.')
          return
        }

        joinedRef.current = true
        setJoined(true)
        setInfo('Joined the consultation room. Waiting for the other participant.')

        if (session.role === 'doctor' && response?.hasPeer) {
          startOffer().catch((offerError) => {
            setError(getFriendlyError(offerError, 'Unable to start the video call.'))
          })
        }
      })
    } catch (requestError) {
      setError(getFriendlyError(requestError, 'Unable to access camera or microphone.'))
    } finally {
      setLoading(false)
    }
  }, [session?.token, session?.role, appointment, appointmentId, startOffer])

  useEffect(() => {
    if (appointment && canStartCall && socketRef.current && !joined && !loading && !joinedRef.current) {
      joinRoom()
    }
  }, [appointment, canStartCall, joined, loading, joinRoom])


  function toggleTrack(kind) {
    const stream = localStreamRef.current
    if (!stream) return

    const track = kind === 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0]
    if (!track) return

    track.enabled = !track.enabled
    if (kind === 'audio') {
      setMicEnabled(track.enabled)
    } else {
      setCamEnabled(track.enabled)
    }
  }

  function endCall() {
    if (session?.token) {
      syncDashboard(session.token)
    }

    socketRef.current?.emit('leave-consultation', { appointmentId })

    pendingIceRef.current = []
    remoteDescriptionReadyRef.current = false
    isOffererRef.current = false
    joinedRef.current = false
    setJoined(false)
    setPeerJoined(false)
    setCallState('Idle')
    setInfo('Call ended.')

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    setMediaReady(false)

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    navigate(-1)
  }

  const canStartCall = appointment ? isCallReady(appointment.status) : false
  const appointmentTitle = appointment
    ? `${appointment.doctor?.name || appointment.doctorId || 'Doctor'} and ${appointment.patient?.name || appointment.patientId || 'Patient'}`
    : 'Consultation room'

  return (
    <div className="portal-page" style={{ minHeight: '100vh' }}>
      <SectionHeader
        eyebrow="Consultation room"
        title={appointmentTitle}
        description={appointment ? `${appointment.date} at ${appointment.time} • ${appointment.status}` : 'Loading consultation details...'}
        action={
          <button type="button" className="portal-button portal-button--ghost" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
        }
      />

      {error ? (
        <div style={{ marginBottom: 16, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: 12, borderRadius: 10 }}>
          {error}
        </div>
      ) : null}

      <div className="portal-grid portal-grid--two" style={{ alignItems: 'start' }}>
        <Panel title="Call controls" description="Open the room and manage your camera / microphone">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Status</strong>
              <p>{callState}</p>
            </article>
            <article className="portal-note">
              <strong>Room</strong>
              <p>{appointment ? `Appointment #${appointment.id}` : 'Loading...'}</p>
            </article>
            <article className="portal-note">
              <strong>Connection</strong>
              <p>{peerJoined ? 'Other participant connected' : 'Waiting for other participant'}</p>
            </article>
            <article className="portal-note">
              <strong>Availability</strong>
              <p>{canStartCall ? 'Ready to start' : 'Waiting for doctor confirmation'}</p>
            </article>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" className="portal-button" onClick={joinRoom} disabled={loading || !canStartCall}>
              <FiVideo /> {loading ? 'Preparing...' : joined ? 'Rejoin room' : 'Join room'}
            </button>
            <button type="button" className="portal-button portal-button--ghost" onClick={() => toggleTrack('audio')} disabled={!mediaReady}>
              {micEnabled ? <FiMic /> : <FiMicOff />} {micEnabled ? 'Mute mic' : 'Unmute mic'}
            </button>
            <button type="button" className="portal-button portal-button--ghost" onClick={() => toggleTrack('video')} disabled={!mediaReady}>
              {camEnabled ? <FiCamera /> : <FiCameraOff />} {camEnabled ? 'Stop camera' : 'Start camera'}
            </button>
            <button type="button" className="portal-button portal-button--ghost" onClick={endCall}>
              <FiPhoneOff /> End call
            </button>
          </div>

          <div style={{ marginTop: 16, color: '#6b7280', fontSize: 13 }}>
            {info}
          </div>
        </Panel>

        <Panel title="Appointment details" description="Everything tied to this consult">
          {loading && !appointment ? (
            <EmptyState title="Loading room" description="Fetching appointment details..." />
          ) : appointment ? (
            <div className="portal-notes">
              <article className="portal-note">
                <strong>Doctor</strong>
                <p>{appointment.doctor?.name || appointment.doctor?.email || appointment.doctorId}</p>
              </article>
              <article className="portal-note">
                <strong>Patient</strong>
                <p>{appointment.patient?.name || appointment.patient?.email || appointment.patientId}</p>
              </article>
              <article className="portal-note">
                <strong>Reason</strong>
                <p>{appointment.reason}</p>
              </article>
              <article className="portal-note">
                <strong>Next step</strong>
                <p>{session.role === 'doctor' ? 'Confirm, consult, and write the prescription.' : 'Wait for the doctor to start the consultation.'}</p>
              </article>
            </div>
          ) : (
            <EmptyState title="Room unavailable" description="We could not load the consultation details." />
          )}
        </Panel>
      </div>
    </div>
  )
}

