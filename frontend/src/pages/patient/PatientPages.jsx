import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFileText, FiHeart, FiMessageSquare, FiSave, FiUsers, FiVideo } from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import { updateMyProfile, readApiError } from '../../api/mediconnectApi'
import { getPatientOverview } from '../../lib/mediconnectStore'
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
  if (value.includes('active') || value.includes('confirmed') || value.includes('completed')) {
    return 'green'
  }
  if (value.includes('pending')) {
    return 'amber'
  }
  if (value.includes('cancel')) {
    return 'rose'
  }

  return 'slate'
}

function PatientDashboardPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getPatientOverview(state, session?.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patient portal"
        title={`Welcome back, ${overview.patient?.name || 'Patient'}`}
        description="Your appointments, records, and assigned doctor stay together in one easy dashboard."
        action={
          <Link className="portal-button" to="/patient/book">
            Book appointment
          </Link>
        }
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Appointments" value={overview.metrics.appointments} detail="Booked visits" tone="blue" />
        <MetricCard icon={FiFileText} label="Records" value={overview.metrics.records} detail="Available reports" tone="green" />
        <MetricCard icon={FiHeart} label="Prescriptions" value={overview.metrics.medications} detail="Medication notes" tone="rose" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.metrics.pendingAppointments} detail="Need follow-up" tone="amber" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="My doctor" description="The clinician assigned to your account">
          {overview.doctor ? (
            <div className="portal-doctor-card">
              <div className="portal-doctor-card__avatar">{(overview.doctor.name || 'D').slice(0, 2)}</div>
              <div>
                <strong>{overview.doctor.name || 'Doctor'}</strong>
                <p>{overview.doctor.specialization || '-'}</p>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                  Status: {overview.doctor.availability || overview.doctor.status || 'Available'}
                </div>
                {overview.doctor.phone ? (
                  <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                    Contact: {overview.doctor.phone}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyState title="No doctor assigned yet" description="The admin team can link your patient profile to a doctor at any time." />
          )}
        </Panel>

        <Panel title="Next steps" description="A few quick actions to keep care moving">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Book your next visit</strong>
              <p>Use the booking screen to pick a free slot for your doctor.</p>
            </article>
            <article className="portal-note">
              <strong>Check appointment approvals</strong>
              <p>Your doctor will confirm, start, and complete visits here.</p>
            </article>
            <article className="portal-note">
              <strong>Review prescriptions</strong>
              <p>Shared notes and medicine instructions stay attached to your timeline.</p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function PatientAppointmentsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  const appointmentRows = overview.appointments
    .filter((appointment) => appointment.status !== 'Cancelled')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)))

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Your visit list"
        description="Every booked appointment is shown here with status and timing details."
        action={
          <Link className="portal-button" to="/patient/book">
            Book new appointment
          </Link>
        }
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Booked" value={overview.metrics.appointments} detail="Appointments on file" tone="blue" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.metrics.pendingAppointments} detail="Needs confirmation" tone="amber" />
        <MetricCard icon={FiMessageSquare} label="Follow-up notes" value={overview.metrics.records} detail="Shared in the portal" tone="violet" />
        <MetricCard icon={FiHeart} label="Consultations" value={overview.metrics.records} detail="Visits with notes" tone="green" />
      </section>

      <Panel title="Appointment history" description="The most recent visits linked to your account">
        {appointmentRows.length ? (
          <Table
            columns={['Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status', 'Action']}
            rows={appointmentRows.map((appointment) => {
              const canJoin = ['Confirmed', 'Accepted', 'In Consultation'].includes(appointment.status)
              return (
                <tr key={appointment.id}>
                  <td>{appointment.doctor?.name || appointment.doctorId || 'Unassigned'}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.mode}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <StatusPill tone={toneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                  </td>
                  <td>
                    {canJoin ? (
                      <Link className="portal-button portal-button--ghost" to={`/consultation/${appointment.id}`}>
                        <FiVideo /> Join room
                      </Link>
                    ) : appointment.status === 'Completed' ? (
                      <Link className="portal-button portal-button--ghost" to="/patient/prescriptions">
                        Review notes
                      </Link>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>Waiting</span>
                    )}
                  </td>
                </tr>
              )
            })}
          />
        ) : (
          <EmptyState title="No appointments yet" description="Your appointments will appear here after you book a visit." />
        )}
      </Panel>
    </div>
  )
}
function PatientPrescriptionsPage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  useEffect(() => {
    if (session?.token) {
      syncDashboard(session.token)
    }
  }, [session?.token, syncDashboard])

  const prescriptions = useMemo(
    () => overview.records.filter((record) => String(record.type || record.title || '').toLowerCase().includes('prescription')),
    [overview.records],
  )

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Prescriptions"
        title="Your prescription history"
        description="Prescriptions written by your doctor appear here as soon as they are saved."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiHeart} label="Prescriptions" value={prescriptions.length} detail="Medication instructions" tone="green" />
        <MetricCard icon={FiFileText} label="Total records" value={overview.records.length} detail="Visit notes" tone="blue" />
        <MetricCard icon={FiCalendar} label="Appointments" value={overview.metrics.appointments} detail="Linked visits" tone="violet" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.metrics.pendingAppointments} detail="Waiting for care team" tone="amber" />
      </section>

      <Panel title="Prescription timeline" description="Only prescriptions shared by your doctor are shown here">
        {prescriptions.length ? (
          <div className="portal-record-grid">
            {prescriptions.map((record) => (
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
                    Doctor: <strong>{record.doctor?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Prescription: <strong>{record.prescription}</strong>
                  </span>
                  {record.prescriptionDetails?.diagnosis ? (
                    <span>
                      Diagnosis: <strong>{record.prescriptionDetails.diagnosis}</strong>
                    </span>
                  ) : null}
                  {Array.isArray(record.prescriptionDetails?.medicines) && record.prescriptionDetails.medicines.length ? (
                    <span>
                      Medicines: <strong>{record.prescriptionDetails.medicines.map((item) => item.name).filter(Boolean).join(', ')}</strong>
                    </span>
                  ) : null}
                  {record.prescriptionDetails?.followUpDate ? (
                    <span>
                      Follow up: <strong>{String(record.prescriptionDetails.followUpDate).slice(0, 10)}</strong>
                    </span>
                  ) : null}
                  <span>
                    Date: <strong>{record.date}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No prescriptions yet" description="Once your doctor writes a prescription, it will show up here." />
        )}
      </Panel>
    </div>
  )
}

function PatientRecordsPage() {
  const { state, session } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Records"
        title="Your medical records"
        description="Patient records and prescriptions stay inside the shared care timeline."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiFileText} label="Records" value={overview.metrics.records} detail="Available to review" tone="blue" />
        <MetricCard icon={FiHeart} label="Prescriptions" value={overview.metrics.medications} detail="Medication notes" tone="green" />
        <MetricCard icon={FiUsers} label="Doctor" value={overview.doctor ? overview.doctor.name.split(' ').slice(0, 2).join(' ') : 'Pending'} detail="Assigned clinician" tone="violet" />
        <MetricCard icon={FiCalendar} label="Last visit" value={overview.patient?.lastVisit || 'New patient'} detail="Latest activity" tone="amber" />
      </section>

      <Panel title="Record timeline" description="Most recent care entries tied to your account">
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
                    Doctor: <strong>{record.doctor?.name || 'Unknown'}</strong>
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
          <EmptyState title="No records yet" description="Your records will appear once the doctor adds notes to your visit." />
        )}
      </Panel>
    </div>
  )
}

function PatientProfilePage() {
  const { state, session, syncDashboard } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)
  const [form, setForm] = useState({
    name: overview.patient?.name || '',
    email: overview.patient?.email || '',
    password: '',
    phone: overview.patient?.phone || '',
    age: overview.patient?.age || '',
    gender: overview.patient?.gender || '',
    condition: overview.patient?.condition || '',
    bloodGroup: overview.patient?.bloodGroup || '',
    address: overview.patient?.address || '',
    notes: overview.patient?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm({
      name: overview.patient?.name || '',
      email: overview.patient?.email || '',
      password: '',
      phone: overview.patient?.phone || '',
      age: overview.patient?.age || '',
      gender: overview.patient?.gender || '',
      condition: overview.patient?.condition || '',
      bloodGroup: overview.patient?.bloodGroup || '',
      address: overview.patient?.address || '',
      notes: overview.patient?.notes || '',
    })
  }, [overview.patient])

  async function handleSave() {
    setError('')
    setSuccess('')

    if (!session?.token) {
      setError('Please sign in again to update your profile.')
      return
    }

    try {
      setSaving(true)
      await updateMyProfile(session.token, form)
      setSuccess('Profile updated successfully.')
      if (session?.token) {
        await syncDashboard(session.token)
      }
      setForm((current) => ({ ...current, password: '' }))
    } catch (requestError) {
      setError(readApiError(requestError, 'Unable to update your profile right now.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Profile"
        title="Your patient profile"
        description="Edit your profile details and keep the care team up to date."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Account details" description="The login information used by this patient">
          <div className="portal-profile-grid">
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Name</span>
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Email</span>
              <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <div className="portal-credential-card">
              <span>Credential status</span>
              <strong>{overview.patient?.credentialStatus || 'Stored securely'}</strong>
            </div>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Phone</span>
              <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Age / Gender</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input value={form.age} onChange={(e) => setForm((current) => ({ ...current, age: e.target.value }))} placeholder="Age" style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
                <input value={form.gender} onChange={(e) => setForm((current) => ({ ...current, gender: e.target.value }))} placeholder="Gender" style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
              </div>
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>Blood group</span>
              <input value={form.bloodGroup} onChange={(e) => setForm((current) => ({ ...current, bloodGroup: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label className="portal-credential-card" style={{ display: 'grid', gap: 6 }}>
              <span>New password</span>
              <input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} placeholder="Leave blank to keep current password" style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
          </div>
        </Panel>

        <Panel title="Care notes" description="Useful registration details for the care team">
          <div className="portal-notes">
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Condition</strong>
              <input value={form.condition} onChange={(e) => setForm((current) => ({ ...current, condition: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Address</strong>
              <textarea rows={3} value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }} />
            </label>
            <label className="portal-note" style={{ display: 'grid', gap: 6 }}>
              <strong>Notes</strong>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', resize: 'vertical' }} />
            </label>
            <article className="portal-note">
              <strong>Assigned doctor</strong>
              <p>{overview.doctor ? overview.doctor.name : 'Pending assignment'}</p>
            </article>
          </div>

          {error ? (
            <div style={{ marginTop: 12, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: 10, borderRadius: 10 }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <div style={{ marginTop: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', padding: 10, borderRadius: 10 }}>
              {success}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="portal-button"
            style={{ marginTop: 16 }}
          >
            <FiSave /> {saving ? 'Saving...' : 'Save profile'}
          </button>
        </Panel>
      </section>
    </div>
  )
}

export {
  PatientAppointmentsPage,
  PatientDashboardPage,
  PatientPrescriptionsPage,
  PatientProfilePage,
  PatientRecordsPage,
}

