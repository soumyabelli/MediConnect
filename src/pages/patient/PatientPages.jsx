import { Link } from 'react-router-dom'
import { FiCalendar, FiFileText, FiHeart, FiMessageSquare, FiUsers } from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import {
  getPatientOverview,
} from '../../lib/mediconnectStore'
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
  const { state, session } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patient portal"
        title={`Welcome back, ${overview.patient?.name || 'Patient'}`}
        description="Your appointments, records, and assigned doctor stay together in one easy dashboard."
        action={
          <Link className="portal-button" to="/patient/appointments">
            View appointments
          </Link>
        }
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Appointments" value={overview.metrics.appointments} detail="Booked visits" tone="blue" />
        <MetricCard icon={FiFileText} label="Records" value={overview.metrics.records} detail="Available reports" tone="green" />
        <MetricCard icon={FiHeart} label="Medications" value={overview.metrics.medications} detail="Prescriptions on file" tone="rose" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.metrics.pendingAppointments} detail="Need follow-up" tone="amber" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="My doctor" description="The clinician assigned to your account">
          {overview.doctor ? (
            <div className="portal-doctor-card">
              <div className="portal-doctor-card__avatar">{overview.doctor.name.slice(0, 2)}</div>
              <div>
                <strong>{overview.doctor.name}</strong>
                <p>{overview.doctor.specialization}</p>
                <span>{overview.doctor.treats}</span>
              </div>
            </div>
          ) : (
            <EmptyState title="No doctor assigned yet" description="The admin team can link your patient profile to a doctor at any time." />
          )}
        </Panel>

        <Panel title="Next steps" description="A few quick actions to keep care moving">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Keep your records updated please</strong>
              <p>Use the records page to review what your doctor has already shared.</p>
            </article>
            <article className="portal-note">
              <strong>Check new appointments</strong>
              <p>Appointment changes will appear here and in the schedule screen.</p>
            </article>
            <article className="portal-note">
              <strong>Ask follow-up questions</strong>
              <p>Use the message area later when chat support is added to the portal.</p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function PatientAppointmentsPage() {
  const { state, session } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Your visit list"
        description="Every booked appointment is shown here with status and timing details."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Booked" value={overview.metrics.appointments} detail="Appointments on file" tone="blue" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.metrics.pendingAppointments} detail="Needs confirmation" tone="amber" />
        <MetricCard icon={FiMessageSquare} label="Follow-up notes" value={overview.metrics.records} detail="Shared in the portal" tone="violet" />
        <MetricCard icon={FiHeart} label="Consultations" value={overview.metrics.records} detail="Visits with notes" tone="green" />
      </section>

      <Panel title="Appointment history" description="The most recent visits linked to your account">
        {overview.appointments.length ? (
          <Table
            columns={['Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
            rows={overview.appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.doctor?.name || 'Unassigned'}</td>
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
          <EmptyState title="No appointments yet" description="Your appointments will appear here after the clinic schedules them." />
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
  const { state, session } = useMediConnect()
  const overview = getPatientOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Profile"
        title="Your patient profile"
        description="Keep the account and registration details visible for easy support."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Account details" description="The login information used by this patient">
          <div className="portal-profile-grid">
            <div className="portal-credential-card">
              <span>Name</span>
              <strong>{overview.patient?.name}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Email</span>
              <strong>{overview.patient?.email}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Credential status</span>
              <strong>{overview.patient?.credentialStatus || 'Stored securely'}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Phone</span>
              <strong>{overview.patient?.phone}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Age / Gender</span>
              <strong>{overview.patient?.age} / {overview.patient?.gender}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Blood group</span>
              <strong>{overview.patient?.bloodGroup}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Care notes" description="Useful registration details for the care team">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Condition</strong>
              <p>{overview.patient?.condition}</p>
            </article>
            <article className="portal-note">
              <strong>Assigned doctor</strong>
              <p>{overview.doctor ? overview.doctor.name : 'Pending assignment'}</p>
            </article>
            <article className="portal-note">
              <strong>Address</strong>
              <p>{overview.patient?.address}</p>
            </article>
            <article className="portal-note">
              <strong>Notes</strong>
              <p>{overview.patient?.notes || 'No extra notes were added during registration.'}</p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

export {
  PatientAppointmentsPage,
  PatientDashboardPage,
  PatientProfilePage,
  PatientRecordsPage,
}
