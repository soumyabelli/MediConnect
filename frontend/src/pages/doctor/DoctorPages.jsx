import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiActivity,
  FiCalendar,
  FiEdit3,
  FiFileText,
  FiHeart,
  FiSend,
  FiUsers,
  FiVideo,
  FiClock,
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import { createRecord, readApiError, updateAppointmentStatus } from '../../api/mediconnectApi'
import { getDoctorOverview } from '../../lib/mediconnectStore'
import {
  EmptyState,
  MetricCard,
  Panel,
  SectionHeader,
  StatusPill,
  Table,
} from '../../components/dashboard/PortalPrimitives'

function toneForStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value.includes('active') || value.includes('accepted') || value.includes('confirmed') || value.includes('completed')) {
    return 'green'
  }
  if (value.includes('pending')) {
    return 'amber'
  }
  if (value.includes('leave')) {
    return 'violet'
  }
  if (value.includes('cancel')) {
    return 'rose'
  }

  return 'slate'
}

function DoctorDashboardPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  const upcomingAppointments = useMemo(
    () => [...overview.appointments].filter((appointment) => appointment.status !== 'Cancelled').slice(0, 5),
    [overview.appointments],
  )

  const recentPatients = useMemo(() => overview.patients.slice(0, 5), [overview.patients])
  const recentRecords = useMemo(() => overview.records.slice(0, 4), [overview.records])

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Doctor portal"
        title={`Welcome back, ${overview.doctor?.name || 'Doctor'}`}
        description="Your appointments, patient list, and prescriptions all update from live clinic data."
        action={
          <Link className="portal-button" to="/doctor/prescriptions">
            Write prescription
          </Link>
        }
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Appointments" value={overview.metrics.upcomingAppointments} detail="Live schedule items" tone="blue" />
        <MetricCard icon={FiUsers} label="Patients" value={overview.metrics.assignedPatients} detail="Assigned to your care" tone="green" />
        <MetricCard icon={FiFileText} label="Records" value={overview.metrics.records} detail="Shared notes" tone="rose" />
        <MetricCard icon={FiActivity} label="Treatments" value={overview.metrics.treatments} detail="Specialty focus" tone="violet" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Today’s appointments" description="The latest live appointments for your account">
          {upcomingAppointments.length ? (
            <Table
              columns={['Patient', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
              rows={upcomingAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient?.name || 'Unknown'}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.mode}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <StatusPill tone={toneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                  </td>
                </tr>
              ))}
            />
          ) : (
            <EmptyState title="No appointments yet" description="New bookings will appear here as soon as patients reserve a slot." />
          )}
        </Panel>

        <Panel title="Recent records" description="Prescriptions and notes already shared with patients">
          {recentRecords.length ? (
            <div className="portal-record-grid">
              {recentRecords.map((record) => (
                <article className="portal-record-card" key={record.id}>
                  <div className="portal-record-card__top">
                    <div>
                      <span>{record.type}</span>
                      <strong>{record.title}</strong>
                    </div>
                    <StatusPill tone="green">Shared</StatusPill>
                  </div>
                  <p>{record.summary}</p>
                  <div className="portal-record-card__meta">
                    <span>
                      Patient: <strong>{record.patient?.name || 'Unknown'}</strong>
                    </span>
                    <span>
                      Prescription: <strong>{record.prescription}</strong>
                    </span>
                    <span>
                      Date: <strong>{record.date}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No prescriptions yet" description="Use the prescription screen to write the first note for a patient." />
          )}
        </Panel>
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Recent patients" description="Assigned patients pulled from the live dashboard">
          {recentPatients.length ? (
            <Table
              columns={['Patient', 'Email', 'Condition', 'Last Visit', 'Status']}
              rows={recentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.condition}</td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <StatusPill tone={toneForStatus(patient.status)}>{patient.status}</StatusPill>
                  </td>
                </tr>
              ))}
            />
          ) : (
            <EmptyState title="No assigned patients" description="Once patients are linked to you, they will appear in this list." />
          )}
        </Panel>

        <Panel title="Quick actions" description="Common tasks you can jump to right now">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Write a prescription</strong>
              <p>Open the prescription form and send the note to a patient timeline.</p>
            </article>
            <article className="portal-note">
              <strong>Review appointments</strong>
              <p>Check the live queue for the next consultations and open slots.</p>
            </article>
            <article className="portal-note">
              <strong>Review records</strong>
              <p>See the medical notes you already stored for your patients.</p>
            </article>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="portal-button" to="/doctor/prescriptions">
              <FiEdit3 /> Write prescription
            </Link>
            <Link className="portal-button portal-button--ghost" to="/doctor/appointments">
              <FiCalendar /> Open appointments
            </Link>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function DoctorAppointmentsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)
  const [busyAppointmentId, setBusyAppointmentId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  async function changeStatus(appointment, status, extra = {}) {
    if (!session?.token) {
      setError('Please sign in again to update appointment status.')
      return
    }

    try {
      setBusyAppointmentId(appointment.id)
      setError('')
      setMessage('')
      await updateAppointmentStatus(session.token, appointment.id, { status, ...extra })
      setMessage(`Appointment ${status.toLowerCase()} for ${appointment.patient?.name || 'the patient'}.`)
      await syncDashboard(session.token)
    } catch (requestError) {
      setError(readApiError(requestError, 'Unable to update the appointment right now.'))
    } finally {
      setBusyAppointmentId('')
    }
  }

  const liveAppointments = [...overview.appointments]
    .filter((appointment) => appointment.status !== 'Cancelled')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)))

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Live appointment queue"
        description="Accept the booking, start the consult, then complete it after the prescription is sent."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Total visits" value={overview.appointments.length} detail="Live appointments" tone="blue" />
        <MetricCard icon={FiClock} label="Pending" value={overview.appointments.filter((appointment) => appointment.status === 'Pending').length} detail="Waiting for approval" tone="amber" />
        <MetricCard icon={FiVideo} label="In consultation" value={overview.appointments.filter((appointment) => appointment.status === 'In Consultation').length} detail="Currently active" tone="green" />
        <MetricCard icon={FiFileText} label="Completed" value={overview.appointments.filter((appointment) => appointment.status === 'Completed').length} detail="Ready in records" tone="violet" />
      </section>

      {error ? (
        <div style={{ marginBottom: 16, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: 12, borderRadius: 10 }}>
          {error}
        </div>
      ) : null}

      {message ? (
        <div style={{ marginBottom: 16, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', padding: 12, borderRadius: 10 }}>
          {message}
        </div>
      ) : null}

      <Panel title="Appointment queue" description="The latest appointments in your schedule">
        {liveAppointments.length ? (
          <Table
            columns={['Patient', 'Reason', 'Date', 'Time', 'Mode', 'Status', 'Action']}
            rows={liveAppointments.map((appointment) => {
              let action = null

              if (appointment.status === 'Pending') {
                action = (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="portal-button"
                      onClick={() => changeStatus(appointment, 'Accepted')}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="portal-button portal-button--ghost"
                      onClick={() => changeStatus(appointment, 'Rejected', { reason: 'Rejected by doctor' })}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Reject
                    </button>
                  </div>
                )
              } else if (appointment.status === 'Confirmed' || appointment.status === 'Accepted') {
                action = (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="portal-button portal-button--ghost" to={`/consultation/${appointment.id}`}>
                      Join room
                    </Link>
                    <button
                      type="button"
                      className="portal-button"
                      onClick={() => changeStatus(appointment, 'In Consultation')}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Start consult
                    </button>
                    <button
                      type="button"
                      className="portal-button portal-button--ghost"
                      onClick={() => changeStatus(appointment, 'Cancelled', { reason: 'Cancelled by doctor' })}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Cancel
                    </button>
                  </div>
                )
              } else if (appointment.status === 'In Consultation') {
                action = (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="portal-button portal-button--ghost" to={`/consultation/${appointment.id}`}>
                      Join room
                    </Link>
                    <button
                      type="button"
                      className="portal-button"
                      onClick={() => changeStatus(appointment, 'Completed')}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Mark complete
                    </button>
                    <button
                      type="button"
                      className="portal-button portal-button--ghost"
                      onClick={() => changeStatus(appointment, 'Cancelled', { reason: 'Consultation cancelled' })}
                      disabled={busyAppointmentId === appointment.id}
                    >
                      Cancel
                    </button>
                  </div>
                )
              } else if (appointment.status === 'Completed') {
                action = (
                  <Link className="portal-button portal-button--ghost" to={`/doctor/prescriptions?patientId=${appointment.patientId}&appointmentId=${appointment.id}`}>
                    Write prescription
                  </Link>
                )
              }

              return (
                <tr key={appointment.id}>
                  <td>{appointment.patient?.name || 'Unknown'}</td>
                  <td>{appointment.reason}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.mode}</td>
                  <td>
                    <StatusPill tone={toneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                  </td>
                  <td>{action || <span style={{ color: '#94a3b8', fontSize: 13 }}>No action</span>}</td>
                </tr>
              )
            })}
          />
        ) : (
          <EmptyState title="Nothing scheduled" description="Appointments assigned to you will appear here." />
        )}
      </Panel>
    </div>
  )
}

function DoctorPatientsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  const patientRows = useMemo(
    () =>
      [...overview.patients]
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
        .map((patient) => {
          const appointmentCount = overview.appointments.filter(
            (appointment) => String(appointment.patientId) === String(patient.id),
          ).length
          const recordCount = overview.records.filter((record) => String(record.patientId) === String(patient.id)).length
          const nextAppointment = [...overview.appointments]
            .filter((appointment) => String(appointment.patientId) === String(patient.id))
            .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)))[0]

          return {
            ...patient,
            appointmentCount,
            recordCount,
            nextAppointment,
          }
        }),
    [overview.appointments, overview.patients, overview.records],
  )

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patients"
        title="Your live patient list"
        description="Every patient linked to your account is shown here with their latest visits and records."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiUsers} label="Patients" value={patientRows.length} detail="Assigned to you" tone="green" />
        <MetricCard icon={FiCalendar} label="Appointments" value={overview.appointments.length} detail="Linked visits" tone="blue" />
        <MetricCard icon={FiFileText} label="Records" value={overview.records.length} detail="Shared notes" tone="rose" />
        <MetricCard icon={FiHeart} label="Follow-ups" value={overview.appointments.filter((appointment) => appointment.status === 'Pending').length} detail="Awaiting action" tone="amber" />
      </section>

      <Panel title="Patient roster" description="Use these links to open the booking, consult, and prescription flow">
        {patientRows.length ? (
          <Table
            columns={['Patient', 'Condition', 'Appointments', 'Records', 'Next visit', 'Action']}
            rows={patientRows.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.condition || '-'}</td>
                <td>{patient.appointmentCount}</td>
                <td>{patient.recordCount}</td>
                <td>{patient.nextAppointment ? `${patient.nextAppointment.date} ${patient.nextAppointment.time}` : 'No visit booked'}</td>
                <td>
                  <Link className="portal-button portal-button--ghost" to={`/doctor/prescriptions?patientId=${patient.id}${patient.nextAppointment ? `&appointmentId=${patient.nextAppointment.id}` : ''}`}>
                    Write prescription
                  </Link>
                </td>
              </tr>
            ))}
          />
        ) : (
          <EmptyState title="No patients assigned" description="Patients linked to you will appear here automatically." />
        )}
      </Panel>
    </div>
  )
}

function DoctorPrescriptionsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    patientId: searchParams.get('patientId') || '',
    appointmentId: searchParams.get('appointmentId') || '',
    title: '',
    summary: '',
    prescription: '',
    diagnosis: '',
    medicines: '',
    notes: '',
    followUpDate: '',
    type: 'Prescription',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  const effectivePatientId = form.patientId || searchParams.get('patientId') || overview.patients[0]?.id || ''
  const effectiveAppointmentId = form.appointmentId || searchParams.get('appointmentId') || ''

  const selectedPatient = overview.patients.find((patient) => String(patient.id) === String(effectivePatientId)) || null
  const selectedAppointment = overview.appointments.find((appointment) => String(appointment.id) === String(effectiveAppointmentId)) || null

  const isPrescriptionType = String(form.type || '').toLowerCase().includes('prescription')

  function parseMedicines(input) {
    return String(input || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|').map((part) => part.trim())
        const [name = '', dosage = '', duration = '', instructions = ''] = parts
        return { name, dosage, duration, instructions }
      })
      .filter((item) => item.name || item.dosage || item.duration || item.instructions)
  }

  async function handleSave() {
    if (!session?.token) {
      setError('Please sign in again to write a prescription.')
      return
    }

    if (!form.patientId || !form.title || !form.summary || !form.prescription) {
      setError('Please choose a patient and complete every field.')
      return
    }

    if (isPrescriptionType && !effectiveAppointmentId) {
      setError('Please link the appointment before sending a prescription.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await createRecord(session.token, {
        patientId: effectivePatientId,
        appointmentId: effectiveAppointmentId,
        title: form.title,
        summary: form.summary,
        prescription: form.prescription,
        prescriptionDetails: {
          diagnosis: form.diagnosis,
          medicines: parseMedicines(form.medicines),
          notes: form.notes,
          followUpDate: form.followUpDate || null,
        },
        type: form.type || 'Prescription',
      })
      setSuccess('Prescription sent to the patient timeline.')
      setForm((current) => ({
        ...current,
        title: '',
        summary: '',
        prescription: '',
        diagnosis: '',
        medicines: '',
        notes: '',
        followUpDate: '',
        appointmentId: '',
      }))
      await syncDashboard(session.token)
    } catch (requestError) {
      setError(readApiError(requestError, 'Unable to save the prescription right now.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Prescriptions"
        title="Write and send a prescription"
        description="Choose the patient, link the appointment if needed, and save the note into the shared care timeline."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Prescription form" description="This will appear in the patient portal after saving">
          <div className="portal-profile-grid">
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Patient</span>
              <select
                value={effectivePatientId}
                onChange={(e) => setForm((current) => ({ ...current, patientId: e.target.value, appointmentId: '' }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              >
                <option value="">Select patient</option>
                {overview.patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Appointment</span>
              <select
                value={effectiveAppointmentId}
                onChange={(e) => setForm((current) => ({ ...current, appointmentId: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              >
                <option value="">Optional appointment link</option>
                {overview.appointments
                  .filter((appointment) => !effectivePatientId || String(appointment.patientId) === String(effectivePatientId))
                  .map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.date} {appointment.time} - {appointment.status}
                    </option>
                  ))}
              </select>
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Visit summary title"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              />
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Type</span>
              <input
                value={form.type}
                onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
                placeholder="Prescription"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              />
            </label>
          </div>

          <div className="portal-notes" style={{ marginTop: 16 }}>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Summary</strong>
              <textarea
                rows={4}
                value={form.summary}
                onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }}
              />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Prescription</strong>
              <textarea
                rows={5}
                value={form.prescription}
                onChange={(e) => setForm((current) => ({ ...current, prescription: e.target.value }))}
                placeholder="Medicine details, dosage, duration, follow-up instructions..."
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }}
              />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Diagnosis</strong>
              <input
                value={form.diagnosis}
                onChange={(e) => setForm((current) => ({ ...current, diagnosis: e.target.value }))}
                placeholder="Diagnosis"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Medicines</strong>
              <textarea
                rows={5}
                value={form.medicines}
                onChange={(e) => setForm((current) => ({ ...current, medicines: e.target.value }))}
                placeholder="One per line: Name | Dosage | Duration | Instructions"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }}
              />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Notes</strong>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                placeholder="Notes"
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }}
              />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Follow-up date</strong>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm((current) => ({ ...current, followUpDate: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
              />
            </label>
          </div>

          {error ? (
            <div style={{ marginTop: 12, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: 12, borderRadius: 10 }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <div style={{ marginTop: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', padding: 12, borderRadius: 10 }}>
              {success}
            </div>
          ) : null}

          <button type="button" className="portal-button" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
            <FiSend /> {saving ? 'Sending...' : 'Send prescription'}
          </button>
        </Panel>

        <Panel title="Current selection" description="The chosen patient and appointment are shown here">
          {selectedPatient ? (
            <div className="portal-notes">
              <article className="portal-note">
                <strong>Patient</strong>
                <p>{selectedPatient.name}</p>
              </article>
              <article className="portal-note">
                <strong>Condition</strong>
                <p>{selectedPatient.condition || '-'}</p>
              </article>
              <article className="portal-note">
                <strong>Address</strong>
                <p>{selectedPatient.address || '-'}</p>
              </article>
              <article className="portal-note">
                <strong>Contact</strong>
                <p>{selectedPatient.phone || selectedPatient.email}</p>
              </article>
            </div>
          ) : (
            <EmptyState title="Pick a patient" description="Select a patient to preload the prescription form." />
          )}

          <div style={{ marginTop: 16 }}>
            {selectedAppointment ? (
              <div className="portal-notes">
                <article className="portal-note">
                  <strong>Appointment</strong>
                  <p>{selectedAppointment.date} at {selectedAppointment.time}</p>
                </article>
                <article className="portal-note">
                  <strong>Status</strong>
                  <p>{selectedAppointment.status}</p>
                </article>
                <article className="portal-note">
                  <strong>Reason</strong>
                  <p>{selectedAppointment.reason}</p>
                </article>
              </div>
            ) : (
              <EmptyState title="No appointment linked" description="You can still send a standalone prescription to this patient." />
            )}
          </div>
        </Panel>
      </section>
    </div>
  )
}

function DoctorRecordsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Records"
        title="Shared records and prescriptions"
        description="Every note you write is stored in the live timeline and becomes visible to the correct patient."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiFileText} label="Records" value={overview.records.length} detail="Saved notes" tone="blue" />
        <MetricCard icon={FiHeart} label="Prescriptions" value={overview.records.filter((record) => String(record.type || '').toLowerCase().includes('prescription')).length} detail="Medication notes" tone="green" />
        <MetricCard icon={FiUsers} label="Patients" value={overview.patients.length} detail="Linked to you" tone="violet" />
        <MetricCard icon={FiClock} label="Latest" value={overview.records[0]?.date || 'None'} detail="Most recent entry" tone="amber" />
      </section>

      <Panel title="Record timeline" description="Sorted by the most recent entries first">
        {overview.records.length ? (
          <div className="portal-record-grid">
            {overview.records.map((record) => (
              <article className="portal-record-card" key={record.id}>
                <div className="portal-record-card__top">
                  <div>
                    <span>{record.type}</span>
                    <strong>{record.title}</strong>
                  </div>
                  <StatusPill tone="green">Shared</StatusPill>
                </div>
                <p>{record.summary}</p>
                <div className="portal-record-card__meta">
                  <span>
                    Patient: <strong>{record.patient?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Prescription: <strong>{record.prescription}</strong>
                  </span>
                  <span>
                    Date: <strong>{record.date}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No records yet" description="After your first prescription, it will show up here." />
        )}
      </Panel>
    </div>
  )
}

function DoctorProfilePage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Profile"
        title="Doctor profile"
        description="Your live profile details are shown here so patients and admins see the latest information."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Profile details" description="This is the user record currently powering the dashboard">
          {overview.doctor ? (
            <div className="portal-notes">
              <article className="portal-note">
                <strong>Name</strong>
                <p>{overview.doctor.name}</p>
              </article>
              <article className="portal-note">
                <strong>Email</strong>
                <p>{overview.doctor.email}</p>
              </article>
              <article className="portal-note">
                <strong>Specialization</strong>
                <p>{overview.doctor.specialization || '-'}</p>
              </article>
              <article className="portal-note">
                <strong>Treats</strong>
                <p>{overview.doctor.treats || '-'}</p>
              </article>
              <article className="portal-note">
                <strong>Availability</strong>
                <p>{overview.doctor.availability || '-'}</p>
              </article>
              <article className="portal-note">
                <strong>Status</strong>
                <p>{overview.doctor.status || 'Active'}</p>
              </article>
            </div>
          ) : (
            <EmptyState title="No doctor profile" description="Sign in again if your doctor profile is missing." />
          )}
        </Panel>

        <Panel title="Clinic summary" description="A quick live snapshot of your dashboard">
          <div className="portal-metric-grid portal-metric-grid--compact">
            <MetricCard icon={FiUsers} label="Patients" value={overview.patients.length} detail="Assigned to you" tone="green" />
            <MetricCard icon={FiCalendar} label="Appointments" value={overview.appointments.length} detail="All visits" tone="blue" />
            <MetricCard icon={FiFileText} label="Records" value={overview.records.length} detail="Shared notes" tone="rose" />
            <MetricCard icon={FiActivity} label="Treats" value={overview.metrics.treatments} detail="Specialties" tone="violet" />
          </div>
        </Panel>
      </section>
    </div>
  )
}

export {
  DoctorAppointmentsPage,
  DoctorDashboardPage,
  DoctorPatientsPage,
  DoctorPrescriptionsPage,
  DoctorProfilePage,
  DoctorRecordsPage,
}
