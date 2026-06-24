import { useMemo, useState } from 'react'
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

function normalizeDateInput(value) {
  if (!value) return ''
  // value from <input type="date"> is already YYYY-MM-DD
  return String(value)
}

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const { publicDoctors, session, syncDashboard } = useMediConnect()



  const doctors = useMemo(() => publicDoctors || [], [publicDoctors])

  const [selectedDoctorId, setSelectedDoctorId] = useState(() => doctorIdOrFirst(doctors))

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d.id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId],
  )


  const [appointmentDate, setAppointmentDate] = useState('')
  const [timeLabel, setTimeLabel] = useState('09:30 AM')
  const [mode, setMode] = useState('Online')
  const [reason, setReason] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function submitBooking() {
    setError('')
    setSuccessMessage('')

    if (!session?.userId) {
      setError('Please login again to book an appointment.')
      return
    }
    if (!selectedDoctorId) {
      setError('Please choose a doctor.')
      return
    }
    if (!appointmentDate) {
      setError('Please select an appointment date.')
      return
    }
    if (!timeLabel) {
      setError('Please select a time.')
      return
    }
    if (!reason.trim()) {
      setError('Please enter a reason for the consultation.')
      return
    }

    // Backend wiring via MediConnect store is not present yet.
    // We'll call the API directly using fetch to keep this page self-contained.
    try {
      setSubmitting(true)
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const token = session?.token

      const response = await fetch(`${apiBase}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentDate: new Date(normalizeDateInput(appointmentDate)).toISOString(),
          timeLabel,
          mode,
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || 'Unable to book appointment right now.')
        return
      }

      setSuccessMessage('Appointment request sent successfully. Status will update when confirmed.')

      try {
        if (session?.token) {
          await syncDashboard(session.token)
        }
      } catch {
        // ignore; navigation will still work
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
        title="Choose a doctor & schedule a consultation"
        description="Select a doctor to book an appointment. Your request will be saved to your patient dashboard."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Doctors" description="Pick who you want to consult with">
          {doctors.length ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {doctors.map((doctor) => {
                const active = String(doctor.id) === String(selectedDoctorId)
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
                        {doctor.city || '—'}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                      Treats: {doctor.treats || '—'}
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
                    onChange={(e) => setAppointmentDate(e.target.value)}
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
                  >
                    {['09:00 AM','09:30 AM','10:00 AM','11:30 AM','01:00 PM','02:30 PM','04:00 PM'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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
                disabled={submitting}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: submitting ? '#f3f4f6' : '#ec4899',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Booking...' : 'Book appointment'}
              </button>

              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Note: after booking, appointments will show in <b>Appointments</b> with status.
              </div>
            </div>
          )}
        </Panel>
      </section>
    </div>
  )
}

function doctorIdOrFirst(doctors) {
  if (Array.isArray(doctors) && doctors.length) return doctors[0].id
  return ''
}

