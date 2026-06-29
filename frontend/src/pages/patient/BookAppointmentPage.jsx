import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiCalendar,
  FiClock,
  FiInfo,
  FiMessageSquare,
  FiUser,
  FiUsers,
  FiVideo,
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import {
  EmptyState,
  Panel,
  SectionHeader,
} from '../../components/dashboard/PortalPrimitives'
import { bookAppointment, fetchAppointmentAvailability, readApiError } from '../../api/mediconnectApi'

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM']

function normalizeDateInput(value) {
  if (!value) return ''
  return String(value)
}

function getFirstSlot(slots) {
  return Array.isArray(slots) && slots.length ? slots[0] : ''
}

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const { publicDoctors, session, syncDashboard } = useMediConnect()

  const doctors = useMemo(() => publicDoctors || [], [publicDoctors])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const effectiveDoctorId = selectedDoctorId || (doctors.length ? doctors[0].id : '')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [timeLabel, setTimeLabel] = useState(getFirstSlot(TIME_SLOTS))
  const [mode, setMode] = useState('Online')
  const [reason, setReason] = useState('')
  const [availableSlots, setAvailableSlots] = useState(TIME_SLOTS)
  const [bookedSlots, setBookedSlots] = useState([])
  const [slotLoading, setSlotLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadAvailability() {
      if (!session?.token || !effectiveDoctorId || !appointmentDate) {
        setAvailableSlots(TIME_SLOTS)
        setBookedSlots([])
        return
      }

      try {
        setSlotLoading(true)
        const response = await fetchAppointmentAvailability(
          session.token,
          effectiveDoctorId,
          normalizeDateInput(appointmentDate),
        )

        if (!active) {
          return
        }

        const nextAvailable = Array.isArray(response?.availableSlots) && response.availableSlots.length
          ? response.availableSlots
          : []
        const nextBooked = Array.isArray(response?.bookedSlots) ? response.bookedSlots : []

        setAvailableSlots(nextAvailable.length ? nextAvailable : [])
        setBookedSlots(nextBooked)

        if (nextAvailable.length) {
          if (!nextAvailable.includes(timeLabel)) {
            setTimeLabel(nextAvailable[0])
          }
        } else {
          setTimeLabel('')
        }
      } catch (requestError) {
        if (!active) {
          return
        }

        setError(readApiError(requestError, 'Unable to load available time slots right now.'))
        setAvailableSlots(TIME_SLOTS)
        setBookedSlots([])
      } finally {
        if (active) {
          setSlotLoading(false)
        }
      }
    }

    loadAvailability()

    return () => {
      active = false
    }
  }, [appointmentDate, effectiveDoctorId, session?.token, timeLabel])

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d.id) === String(effectiveDoctorId)) || null,
    [doctors, effectiveDoctorId],
  )

  async function submitBooking() {
    setError('')
    setSuccessMessage('')

    if (!session?.userId) {
      setError('Please login again to book an appointment.')
      return
    }
    if (!effectiveDoctorId) {
      setError('Please choose a doctor.')
      return
    }
    if (!appointmentDate) {
      setError('Please select an appointment date.')
      return
    }
    if (!timeLabel) {
      setError('Please select an available time.')
      return
    }
    if (!reason.trim()) {
      setError('Please enter a reason for the consultation.')
      return
    }

    try {
      setSubmitting(true)
      await bookAppointment(session.token, {
        doctorId: effectiveDoctorId,
        appointmentDate: new Date(normalizeDateInput(appointmentDate)).toISOString(),
        timeLabel,
        mode,
        reason,
      })

      setSuccessMessage('Appointment request sent successfully. Status will update when confirmed.')

      try {
        if (session?.token) {
          await syncDashboard(session.token)
        }
      } catch {
        // ignore sync errors so navigation still completes
      }

      navigate('/patient/appointments')
    } catch (e) {
      setError(e?.message || 'Unable to book appointment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Book appointment"
        title="Choose a doctor and a free time"
        description="Only available time slots are shown for the selected doctor and date."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Doctors" description="Pick who you want to consult with">
          {doctors.length ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {doctors.map((doctor) => {
                const active = String(doctor.id) === String(effectiveDoctorId)
                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId(doctor.id)
                      setSuccessMessage('')
                      setError('')
                    }}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 10,
                      border: active ? '1px solid rgba(236,72,153,0.7)' : '1px solid #e5e7eb',
                      background: active ? 'rgba(236,72,153,0.06)' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          display: 'grid',
                          placeItems: 'center',
                          background: active ? 'rgba(236,72,153,0.15)' : '#f3f4f6',
                        }}
                      >
                        <FiUser />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{doctor.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{doctor.specialization}</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        <FiInfo style={{ display: 'inline', marginRight: 6 }} />
                        {doctor.city || '-'}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                      Treats: {doctor.treats || '-'}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No doctors available" description="The clinic has not published the doctor list yet." />
          )}
        </Panel>

        <Panel title="Consultation details" description="Fill in appointment information">
          {!selectedDoctor ? (
            <EmptyState title="Choose a doctor" description="Select a doctor from the list to book." />
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff3f8', display: 'grid', placeItems: 'center' }}>
                  <FiVideo />
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>{selectedDoctor.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{selectedDoctor.specialization}</div>
                </div>
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Date</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FiCalendar />
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value)
                      setSuccessMessage('')
                      setError('')
                    }}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                </div>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Time</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FiClock />
                  <select
                    value={timeLabel}
                    onChange={(e) => setTimeLabel(e.target.value)}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
                    disabled={slotLoading || !appointmentDate}
                  >
                    {(availableSlots.length ? availableSlots : []).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>
                  {appointmentDate
                    ? slotLoading
                      ? 'Checking live availability...'
                      : availableSlots.length
                        ? `${availableSlots.length} slot(s) available. ${bookedSlots.length ? `${bookedSlots.length} booked already.` : ''}`
                        : 'No open slots remain for this doctor on the selected date.'
                    : 'Pick a date to see live availability.'}
                </div>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Mode</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FiUsers />
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
                  >
                    {['Online', 'In Clinic'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Reason</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <FiMessageSquare />
                  <input
                    type="text"
                    value={reason}
                    placeholder="Describe your symptoms / requirement"
                    onChange={(e) => setReason(e.target.value)}
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                </div>
              </label>

              {error ? (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: 10, borderRadius: 10 }}>
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', padding: 10, borderRadius: 10 }}>
                  {successMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={submitBooking}
                disabled={submitting || !availableSlots.length}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: submitting || !availableSlots.length ? '#f3f4f6' : '#ec4899',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: submitting || !availableSlots.length ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Booking...' : 'Book appointment'}
              </button>

              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Note: if another patient books the same doctor and time, that slot disappears from this list.
              </div>
            </div>
          )}
        </Panel>
      </section>
    </div>
  )
}
