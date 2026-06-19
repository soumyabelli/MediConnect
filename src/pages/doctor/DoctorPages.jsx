import { Link } from 'react-router-dom'
import { FiActivity, FiCalendar, FiFileText, FiUsers } from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import {
  getDoctorOverview,
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
  if (value.includes('leave')) {
    return 'violet'
  }
  if (value.includes('cancel')) {
    return 'rose'
  }

  return 'slate'
}

function DoctorDashboardPage() {
  const { state, session } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Doctor overview"
        title={`Welcome back, ${overview.doctor?.name || 'Doctor'}`}
        description="Review your patients, scheduled visits, and the notes that belong to your practice."
        action={
          <Link className="portal-button" to="/doctor/patients">
            Open patients
          </Link>
        }
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiUsers} label="Assigned patients" value={overview.metrics.assignedPatients} detail="Linked to your account" tone="blue" />
        <MetricCard icon={FiCalendar} label="Upcoming appointments" value={overview.metrics.upcomingAppointments} detail="Waiting in your schedule" tone="amber" />
        <MetricCard icon={FiFileText} label="Records" value={overview.metrics.records} detail="Shared with you" tone="green" />
        <MetricCard icon={FiActivity} label="Treatments" value={overview.metrics.treatments} detail="Specialty areas you cover" tone="violet" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="My Patients" description="Patients currently assigned to this doctor">
          {overview.patients.length ? (
            <Table
              columns={['Patient', 'Age', 'Condition', 'Status']}
              rows={overview.patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.condition}</td>
                  <td>
                    <StatusPill tone={toneForStatus(patient.status)}>{patient.status}</StatusPill>
                  </td>
                </tr>
              ))}
            />
          ) : (
            <EmptyState title="No assigned patients" description="Patients will appear here once the admin links them to your account." />
          )}
        </Panel>

        <Panel title="Upcoming Schedule" description="Live appointments tied to this doctor">
          {overview.appointments.length ? (
            <Table
              columns={['Patient', 'Date', 'Time', 'Mode', 'Status']}
              rows={overview.appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient?.name || 'Unknown'}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.mode}</td>
                  <td>
                    <StatusPill tone={toneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                  </td>
                </tr>
              ))}
            />
          ) : (
            <EmptyState title="No schedule yet" description="Your next appointments will show up here when they are booked." />
          )}
        </Panel>
      </section>
    </div>
  )
}

function DoctorPatientsPage() {
  const { state, session } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patients"
        title="Assigned patient list"
        description="Each entry shows the details the doctor needs before the consultation starts."
      />

      <Panel title="Patients under care" description="All patients linked to your treatment list">
        {overview.patients.length ? (
          <Table
            columns={['Patient', 'Email', 'Age', 'Gender', 'Condition', 'Last Visit', 'Status']}
            rows={overview.patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.condition}</td>
                <td>{patient.lastVisit}</td>
                <td>
                  <StatusPill tone={toneForStatus(patient.status)}>{patient.status}</StatusPill>
                </td>
              </tr>
            ))}
          />
        ) : (
          <EmptyState title="No patients yet" description="Once admin assigns patients to you, their profiles will appear here." />
        )}
      </Panel>
    </div>
  )
}

function DoctorSchedulePage() {
  const { state, session } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Schedule"
        title="Consultation schedule"
        description="Use this view to track what is next, what is pending, and what has already closed."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Total visits" value={overview.appointments.length} detail="Appointments on record" tone="blue" />
        <MetricCard icon={FiActivity} label="Confirmed" value={overview.appointments.filter((appointment) => appointment.status === 'Confirmed').length} detail="Ready for consult" tone="green" />
        <MetricCard icon={FiUsers} label="Pending" value={overview.appointments.filter((appointment) => appointment.status === 'Pending').length} detail="Needs review" tone="amber" />
        <MetricCard icon={FiFileText} label="Completed" value={overview.appointments.filter((appointment) => appointment.status === 'Completed').length} detail="Closed visits" tone="violet" />
      </section>

      <Panel title="Appointment queue" description="The latest appointments in your schedule">
        {overview.appointments.length ? (
          <Table
            columns={['Patient', 'Reason', 'Date', 'Time', 'Mode', 'Status']}
            rows={overview.appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patient?.name || 'Unknown'}</td>
                <td>{appointment.reason}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.mode}</td>
                <td>
                  <StatusPill tone={toneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                </td>
              </tr>
            ))}
          />
        ) : (
          <EmptyState title="Nothing scheduled" description="Appointments assigned to you will appear here." />
        )}
      </Panel>
    </div>
  )
}

function DoctorRecordsPage() {
  const { state, session } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Records"
        title="Shared records and prescriptions"
        description="These notes belong to patients assigned to your account."
      />

      <Panel title="Record list" description="The latest notes and prescriptions from your patients">
        {overview.records.length ? (
          <div className="portal-record-grid">
            {overview.records.map((record) => (
              <article className="portal-record-card" key={record.id}>
                <div className="portal-record-card__top">
                  <div>
                    <span>{record.type}</span>
                    <strong>{record.title}</strong>
                  </div>
                  <StatusPill tone={toneForStatus('Completed')}>Shared</StatusPill>
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
          <EmptyState title="No records yet" description="Once you open a consultation, the notes and prescriptions will appear here." />
        )}
      </Panel>
    </div>
  )
}

function DoctorProfilePage() {
  const { state, session } = useMediConnect()
  const overview = getDoctorOverview(state, session.userId)
  const doctor = overview.doctor
  const records = overview.records

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Profile"
        title="Your doctor account"
        description="Keep the login and treatment summary visible for the doctor dashboard."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Account details" description="Everything the admin needs to keep on file">
          <div className="portal-profile-grid">
            <div className="portal-credential-card">
              <span>Name</span>
              <strong>{doctor?.name}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Email</span>
              <strong>{doctor?.email}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Credential status</span>
              <strong>{doctor?.credentialStatus || 'Stored securely'}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Phone</span>
              <strong>{doctor?.phone}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Specialization</span>
              <strong>{doctor?.specialization}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Availability</span>
              <strong>{doctor?.availability}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Treatment focus" description="Who you can treat and what the practice currently handles">
          <div className="portal-treatment-list">
            <article className="portal-note">
              <strong>Treats</strong>
              <p>{doctor?.treats}</p>
            </article>
            <article className="portal-note">
              <strong>Bio</strong>
              <p>{doctor?.bio}</p>
            </article>
            <article className="portal-note">
              <strong>Consultation fee</strong>
              <p>{doctor?.fee}</p>
            </article>
            <article className="portal-note">
              <strong>Shared records</strong>
              <p>{records.length} record(s) linked to your patients.</p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

export {
  DoctorDashboardPage,
  DoctorRecordsPage,
  DoctorPatientsPage,
  DoctorProfilePage,
  DoctorSchedulePage,
}
