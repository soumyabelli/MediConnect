import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiActivity,
  FiAlertCircle,
  FiBell,
  FiArrowRight,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiHeart,
  FiPlusCircle,
  FiShield,
  FiUsers,
  FiUser,
  FiVideo,
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import {
  getAdminOverview,
  getDoctorById,
  getRecordsForPatient,
} from '../../lib/mediconnectStore'
import {
  EmptyState,
  MetricCard,
  Panel,
  SectionHeader,
  Sparkline,
  StatusPill,
  Table,
} from '../../components/dashboard/PortalPrimitives'

function getToneForStatus(status) {
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
  if (value.includes('leave') || value.includes('approval')) {
    return 'violet'
  }

  return 'slate'
}

function shortList(value, fallback = 'General care') {
  if (!value) {
    return fallback
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(', ')
}

function AdminDashboardPage() {
  const { state } = useMediConnect()
  const overview = getAdminOverview(state)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Admin overview"
        title="Welcome back, Admin"
        description="Keep every doctors, patients, appointments, and records in one clean control center."
        action={
          <div className="portal-action-row">
            <Link className="portal-button" to="/admin/doctors">
              Add doctor
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link className="portal-button portal-button--ghost" to="/admin/patients">
              View patients
            </Link>
          </div>
        }
      />

      <section className="portal-metric-grid">
        <MetricCard icon={FiUsers} label="Total Doctors" value={overview.metrics.totalDoctors} detail="+12 this month" tone="blue" />
        <MetricCard icon={FiHeart} label="Total Patients" value={overview.metrics.totalPatients} detail="+45 this month" tone="green" />
        <MetricCard icon={FiCalendar} label="Today's Appointments" value={overview.metrics.todaysAppointments} detail="Follow-up queue" tone="amber" />
        <MetricCard icon={FiActivity} label="Active Consultations" value={overview.metrics.activeConsultations} detail="Live right now" tone="violet" />
        <MetricCard icon={FiFileText} label="Health Records" value={overview.metrics.totalHealthRecords} detail="Stored securely" tone="rose" />
        <MetricCard icon={FiClipboard} label="Prescriptions" value={overview.metrics.prescriptionsGenerated} detail="Generated this month" tone="teal" />
        <MetricCard icon={FiShield} label="Monthly Consultations" value={overview.metrics.monthlyConsultations} detail="Clinic-wide activity" tone="blue" />
        <MetricCard icon={FiAlertCircle} label="Pending Requests" value={overview.metrics.pendingRequests} detail="Needs your attention" tone="amber" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Recent Appointments" description="Newest appointments across the clinic">
          <Table
            columns={['Patient', 'Doctor', 'Date', 'Time', 'Status']}
            rows={overview.recentAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patient?.name || 'Unknown patient'}</td>
                <td>{appointment.doctor?.name || 'Unassigned'}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
                </td>
              </tr>
            ))}
            emptyMessage="No appointments yet."
          />
        </Panel>

        <Panel title="Recent Patients" description="Recently registered patients and their assigned doctor">
          <Table
            columns={['Patient', 'Age', 'Gender', 'Doctor', 'Status']}
            rows={overview.recentPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.doctor?.name || 'Pending assignment'}</td>
                <td>
                  <StatusPill tone={getToneForStatus(patient.status)}>{patient.status}</StatusPill>
                </td>
              </tr>
            ))}
            emptyMessage="No patients yet."
          />
        </Panel>
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Recent Doctors" description="Clinician accounts created by the admin team">
          <Table
            columns={['Doctor', 'Specialization', 'Treats', 'Status']}
            rows={overview.recentDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.specialization}</td>
                <td>{shortList(doctor.treats)}</td>
                <td>
                  <StatusPill tone={getToneForStatus(doctor.status)}>{doctor.status}</StatusPill>
                </td>
              </tr>
            ))}
            emptyMessage="No doctors yet."
          />
        </Panel>

        <Panel title="System Analytics" description="Lightweight trends based on the current clinic data">
          <div className="portal-analytics-grid">
            <article className="portal-analytics-card">
              <div>
                <span>Appointments trend</span>
                <strong>{overview.metrics.monthlyConsultations}</strong>
                <p>Clinic throughput is stable this month.</p>
              </div>
              <Sparkline points={[10, 14, 18, 24, 20, 23, 28, 26]} tone="blue" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Patient growth</span>
                <strong>{overview.metrics.totalPatients}</strong>
                <p>New registrations are being captured.</p>
              </div>
              <Sparkline points={[6, 8, 11, 14, 18, 19, 22, 24]} tone="green" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Consultations</span>
                <strong>{overview.metrics.activeConsultations + overview.metrics.pendingRequests}</strong>
                <p>Live work waiting on the clinic team.</p>
              </div>
              <Sparkline points={[8, 9, 10, 16, 15, 18, 14, 19]} tone="violet" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Doctor activity</span>
                <strong>{overview.metrics.totalDoctors ? Math.round((overview.metrics.activeConsultations / overview.metrics.totalDoctors) * 100) : 0}%</strong>
                <p>Share of doctors currently engaged.</p>
              </div>
              <Sparkline points={[8, 12, 16, 19, 17, 13, 15, 18]} tone="amber" />
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function AdminDoctorsPage() {
  const { state, createDoctor } = useMediConnect()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    treats: '',
    availability: '',
    fee: '',
    experience: '',
    city: '',
    bio: '',
    status: 'Active',
  })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await createDoctor(form)

    if (!result.ok) {
      setError(result.message)
      setNotice('')
      return
    }

    setNotice(
      result.temporaryPassword
        ? `Created ${result.doctor.name}. Temporary password: ${result.temporaryPassword}`
        : `Created ${result.doctor.name}. The login is ready for the doctor dashboard.`,
    )
    setError('')
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      treats: '',
      availability: '',
      fee: '',
      experience: '',
      city: '',
      bio: '',
      status: 'Active',
    })
  }

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Doctors"
        title="Add and manage doctor accounts"
        description="Create the doctor login, define who they can treat, and keep the credential list inside admin."
      />

      <section className="portal-grid portal-grid--two portal-grid--top">
        <Panel title="Add Doctor" description="These details are used by the doctor to sign in">
          <form className="portal-form" onSubmit={handleSubmit}>
            <div className="portal-form__grid">
              <label className="portal-field">
                Full name
                <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Riya Shah" />
              </label>
              <label className="portal-field">
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@mediconnect.com" />
              </label>
            <label className="portal-field">
                Temporary password
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary login password" />
              </label>
              <label className="portal-field">
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 90000 00002" />
              </label>
              <label className="portal-field">
                Specialization
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Cardiologist" />
              </label>
              <label className="portal-field">
                Consultation fee
                <input name="fee" value={form.fee} onChange={handleChange} placeholder="INR 900" />
              </label>
              <label className="portal-field">
                Treats
                <input name="treats" value={form.treats} onChange={handleChange} placeholder="Heart care, Blood pressure" />
              </label>
              <label className="portal-field">
                Availability
                <input name="availability" value={form.availability} onChange={handleChange} placeholder="Mon, Wed, Fri" />
              </label>
              <label className="portal-field">
                Experience
                <input name="experience" value={form.experience} onChange={handleChange} placeholder="10 years" />
              </label>
              <label className="portal-field">
                City
                <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
              </label>
              <label className="portal-field portal-field--full">
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Pending Approval</option>
                </select>
              </label>
              <label className="portal-field portal-field--full">
                Bio
                <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" placeholder="Short doctor profile for the portal" />
              </label>
            </div>

            {notice ? <p className="portal-form__message portal-form__message--success">{notice}</p> : null}
            {error ? <p className="portal-form__message portal-form__message--error">{error}</p> : null}

            <button type="submit" className="portal-button">
              Create doctor account
              <FiPlusCircle aria-hidden="true" />
            </button>
          </form>
        </Panel>

        <Panel title="Doctor Directory" description="Email and credential status are available to the admin team">
          <Table
            columns={['Name', 'Email', 'Specialization', 'Treats', 'Credential', 'Status']}
            rows={state.doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.email}</td>
                <td>{doctor.specialization}</td>
                <td>{shortList(doctor.treats)}</td>
                <td>{doctor.credentialStatus || 'Stored securely'}</td>
                <td>
                  <StatusPill tone={getToneForStatus(doctor.status)}>{doctor.status}</StatusPill>
                </td>
              </tr>
            ))}
            emptyMessage="No doctors have been created yet."
          />
        </Panel>
      </section>
    </div>
  )
}

function AdminPatientsPage() {
  const { state } = useMediConnect()
  const overview = getAdminOverview(state)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patients"
        title="Registered patients and their access"
        description="Patient sign-ups flow here automatically so the admin team can see who joined and who is assigned."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiHeart} label="Registered patients" value={overview.metrics.totalPatients} detail="All patient accounts" tone="green" />
        <MetricCard icon={FiUser} label="Active patients" value={state.patients.filter((patient) => patient.status === 'Active').length} detail="In care right now" tone="blue" />
        <MetricCard icon={FiAlertCircle} label="Pending patients" value={state.patients.filter((patient) => patient.status === 'Pending').length} detail="Need assignment" tone="amber" />
        <MetricCard icon={FiClipboard} label="Records available" value={overview.metrics.totalHealthRecords} detail="Linked to patient profiles" tone="violet" />
      </section>

      <Panel title="Patient Directory" description="All patient details that were registered through the portal">
        <Table
          columns={['Patient', 'Email', 'Age', 'Gender', 'Condition', 'Doctor', 'Credential', 'Status', 'Last Visit']}
          rows={state.patients.map((patient) => {
            const doctor = getDoctorById(state, patient.assignedDoctorId)

            return (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.condition}</td>
                <td>{doctor?.name || 'Pending assignment'}</td>
                <td>{patient.credentialStatus || 'Stored securely'}</td>
                <td>
                  <StatusPill tone={getToneForStatus(patient.status)}>{patient.status}</StatusPill>
                </td>
                <td>{patient.lastVisit}</td>
              </tr>
            )
          })}
          emptyMessage="No patients have registered yet."
        />
      </Panel>
    </div>
  )
}

function AdminAppointmentsPage() {
  const { state } = useMediConnect()

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Appointment queue"
        description="Track the current consult list, status, and assigned clinicians."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Confirmed" value={state.appointments.filter((item) => item.status === 'Confirmed').length} detail="Ready to start" tone="green" />
        <MetricCard icon={FiAlertCircle} label="Pending" value={state.appointments.filter((item) => item.status === 'Pending').length} detail="Waiting on response" tone="amber" />
        <MetricCard icon={FiClipboard} label="Completed" value={state.appointments.filter((item) => item.status === 'Completed').length} detail="Closed visits" tone="blue" />
        <MetricCard icon={FiHeart} label="Cancelled" value={state.appointments.filter((item) => item.status === 'Cancelled').length} detail="Removed from schedule" tone="rose" />
      </section>

      <Panel title="Visit Schedule" description="All appointments and their live status">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
          rows={state.appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patient?.name || 'Unknown'}</td>
              <td>{appointment.doctor?.name || 'Unassigned'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.mode}</td>
              <td>{appointment.reason}</td>
              <td>
                <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="No appointments scheduled yet."
        />
      </Panel>
    </div>
  )
}

function AdminRecordsPage() {
  const { state } = useMediConnect()
  const overview = getAdminOverview(state)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Electronic Health Records"
        title="Shared medical records"
        description="Every record stays tied to the right patient and doctor for easy follow-up."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiFileText} label="Medical notes" value={overview.metrics.totalHealthRecords} detail="Indexed by patient" tone="blue" />
        <MetricCard icon={FiClipboard} label="Prescriptions" value={overview.metrics.prescriptionsGenerated} detail="Issued to patients" tone="green" />
        <MetricCard icon={FiShield} label="Protected access" value="100%" detail="Role-based visibility" tone="violet" />
        <MetricCard icon={FiHeart} label="Clinic records" value={state.records.length} detail="Current record history" tone="amber" />
      </section>

      <Panel title="Record archive" description="Every record added across the clinic">
        {state.records.length ? (
          <div className="portal-record-grid">
            {state.records.map((record) => (
              <article className="portal-record-card" key={record.id}>
                <div className="portal-record-card__top">
                  <div>
                    <span>{record.type}</span>
                    <strong>{record.title}</strong>
                  </div>
                  <StatusPill tone={getToneForStatus('Completed')}>Shared</StatusPill>
                </div>
                <p>{record.summary}</p>
                <div className="portal-record-card__meta">
                  <span>
                    Patient: <strong>{record.patient?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Doctor: <strong>{record.doctor?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Prescription: <strong>{record.prescription}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No records yet"
            description="Patient records will appear here once doctors add notes and prescriptions."
          />
        )}
      </Panel>
    </div>
  )
}

function AdminReportsPage() {
  const { state } = useMediConnect()
  const overview = getAdminOverview(state)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Reports & Analytics"
        title="Clinic performance snapshot"
        description="A quick look at how the clinic is moving across appointments, consultations, and records."
      />

      <section className="portal-analytics-overview">
        <MetricCard icon={FiCalendar} label="Consultation volume" value={overview.metrics.monthlyConsultations} detail="Current month" tone="blue" />
        <MetricCard icon={FiUsers} label="Doctor count" value={overview.metrics.totalDoctors} detail="Active clinician accounts" tone="green" />
        <MetricCard icon={FiHeart} label="Patient count" value={overview.metrics.totalPatients} detail="Registered patients" tone="rose" />
        <MetricCard icon={FiAlertCircle} label="Pending tasks" value={overview.metrics.pendingRequests} detail="Needs review" tone="amber" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Trend lines" description="Compact activity snapshots that help you spot changes quickly">
          <div className="portal-analytics-grid">
            <article className="portal-analytics-card">
              <div>
                <span>Appointment trend</span>
                <strong>{overview.metrics.monthlyConsultations}</strong>
                <p>All appointments on the books.</p>
              </div>
              <Sparkline points={[12, 14, 16, 20, 18, 21, 25, 24]} tone="blue" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Patient growth</span>
                <strong>{overview.metrics.totalPatients}</strong>
                <p>New registrations are flowing in.</p>
              </div>
              <Sparkline points={[8, 10, 12, 15, 18, 19, 21, 23]} tone="green" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Records generated</span>
                <strong>{overview.metrics.totalHealthRecords}</strong>
                <p>More patient context is being captured.</p>
              </div>
              <Sparkline points={[5, 8, 10, 11, 14, 16, 18, 19]} tone="violet" />
            </article>
            <article className="portal-analytics-card">
              <div>
                <span>Pending requests</span>
                <strong>{overview.metrics.pendingRequests}</strong>
                <p>Check these before the next shift.</p>
              </div>
              <Sparkline points={[4, 5, 7, 8, 7, 9, 11, 10]} tone="amber" />
            </article>
          </div>
        </Panel>

        <Panel title="Operational notes" description="A few current observations from the clinic data">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Doctors are ready for login</strong>
              <p>
                New doctor accounts created in the admin panel can sign in with the email and temporary password you assign.
              </p>
            </article>
            <article className="portal-note">
              <strong>Patient registrations flow through admin</strong>
              <p>
                Every patient signup is saved in the shared app state and becomes visible to the admin team.
              </p>
            </article>
            <article className="portal-note">
              <strong>Records stay tied to the visit</strong>
              <p>
                Appointments and prescriptions remain linked so doctors and patients can keep the full story together.
              </p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function AdminSettingsPage() {
  const { state } = useMediConnect()

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Settings"
        title="Portal settings and admin access"
        description="This page keeps the current admin login visible and gives you a few quick control notes."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Admin access" description="The current seeded admin identity for this portal">
          <div className="portal-credential-card">
            <span>Email</span>
            <strong>{state.admin.email}</strong>
          </div>
          <div className="portal-credential-card">
            <span>Credential status</span>
            <strong>{state.admin.credentialStatus || 'Stored securely'}</strong>
          </div>
          <div className="portal-credential-card">
            <span>Role</span>
            <strong>{state.admin.title}</strong>
          </div>
        </Panel>

        <Panel title="What admin can do" description="Everything in this prototype stays under the same control panel">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Create doctors</strong>
              <p>Set the login, specialization, and treatment areas for each clinician.</p>
            </article>
            <article className="portal-note">
              <strong>Review patients</strong>
              <p>All registrations and their credential status are available in the patient directory.</p>
            </article>
            <article className="portal-note">
              <strong>Track records</strong>
              <p>Appointments, notes, and prescriptions are visible from the admin screens.</p>
            </article>
          </div>

          <Link className="portal-button portal-button--ghost" to="/admin/doctors">
            Open doctor manager
          </Link>
        </Panel>
      </section>
    </div>
  )
}

function AdminDoctorApprovalsPage() {
  const { state } = useMediConnect()
  const pendingDoctors = state.doctors.filter(
    (doctor) => String(doctor.status || '').toLowerCase() !== 'active',
  )

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Doctors"
        title="Doctor approvals"
        description="Review doctors that are waiting for approval or are currently on leave."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiUsers} label="Total doctors" value={state.doctors.length} detail="All clinician accounts" tone="blue" />
        <MetricCard icon={FiBell} label="Pending review" value={pendingDoctors.length} detail="Need admin action" tone="amber" />
        <MetricCard icon={FiShield} label="Active" value={state.doctors.filter((doctor) => doctor.status === 'Active').length} detail="Ready for login" tone="green" />
        <MetricCard icon={FiActivity} label="Approval queue" value={pendingDoctors.length} detail="Doctor onboarding" tone="violet" />
      </section>

      <Panel title="Approval queue" description="Doctor accounts that are not yet in the active list">
        <Table
          columns={['Doctor', 'Email', 'Specialization', 'Treats', 'Status']}
          rows={pendingDoctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td>
              <td>{doctor.email}</td>
              <td>{doctor.specialization}</td>
              <td>{shortList(doctor.treats)}</td>
              <td>
                <StatusPill tone={getToneForStatus(doctor.status)}>{doctor.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="All doctors are currently active."
        />
      </Panel>
    </div>
  )
}

function AdminPatientRecordsPage() {
  const { state } = useMediConnect()

  const rows = state.patients.map((patient) => {
    const doctor = getDoctorById(state, patient.assignedDoctorId)
    const records = getRecordsForPatient(state, patient.id)

    return (
      <tr key={patient.id}>
        <td>{patient.name}</td>
        <td>{patient.email}</td>
        <td>{doctor?.name || 'Pending assignment'}</td>
        <td>{records.length}</td>
        <td>{patient.lastVisit}</td>
        <td>
          <StatusPill tone={getToneForStatus(patient.status)}>{patient.status}</StatusPill>
        </td>
      </tr>
    )
  })

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Patients"
        title="Patient records"
        description="See how many records each patient has, plus the assigned clinician and the latest visit date."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiHeart} label="Patients" value={state.patients.length} detail="Registered accounts" tone="green" />
        <MetricCard icon={FiFileText} label="Record links" value={state.records.length} detail="Shared care notes" tone="blue" />
        <MetricCard icon={FiUsers} label="Assigned" value={state.patients.filter((patient) => patient.assignedDoctorId).length} detail="Linked to a doctor" tone="violet" />
        <MetricCard icon={FiBell} label="Awaiting assignment" value={state.patients.filter((patient) => !patient.assignedDoctorId).length} detail="Need doctor review" tone="amber" />
      </section>

      <Panel title="Patient record register" description="Each patient row includes their live record count">
        <Table
          columns={['Patient', 'Email', 'Doctor', 'Records', 'Last Visit', 'Status']}
          rows={rows}
          emptyMessage="No patients have registered yet."
        />
      </Panel>
    </div>
  )
}

function AdminPendingAppointmentsPage() {
  const { state } = useMediConnect()
  const appointments = state.appointments.filter((appointment) => appointment.status === 'Pending')

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Pending appointments"
        description="These visits are still waiting for confirmation or a response from the care team."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiBell} label="Pending" value={appointments.length} detail="Waiting in queue" tone="amber" />
        <MetricCard icon={FiCalendar} label="Confirmed" value={state.appointments.filter((item) => item.status === 'Confirmed').length} detail="Next in line" tone="green" />
        <MetricCard icon={FiClipboard} label="Completed" value={state.appointments.filter((item) => item.status === 'Completed').length} detail="Already closed" tone="blue" />
        <MetricCard icon={FiActivity} label="Total" value={state.appointments.length} detail="All appointments" tone="violet" />
      </section>

      <Panel title="Pending queue" description="Appointments that need action">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
          rows={appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patient?.name || 'Unknown'}</td>
              <td>{appointment.doctor?.name || 'Unassigned'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.mode}</td>
              <td>{appointment.reason}</td>
              <td>
                <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="No pending appointments right now."
        />
      </Panel>
    </div>
  )
}

function AdminCompletedAppointmentsPage() {
  const { state } = useMediConnect()
  const appointments = state.appointments.filter((appointment) => appointment.status === 'Completed')

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Appointments"
        title="Completed appointments"
        description="A quick view of closed visits and the outcomes that are already finished."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiClipboard} label="Completed" value={appointments.length} detail="Finished consults" tone="green" />
        <MetricCard icon={FiBell} label="Pending" value={state.appointments.filter((item) => item.status === 'Pending').length} detail="Still waiting" tone="amber" />
        <MetricCard icon={FiCalendar} label="Confirmed" value={state.appointments.filter((item) => item.status === 'Confirmed').length} detail="Ready for next" tone="blue" />
        <MetricCard icon={FiActivity} label="Total" value={state.appointments.length} detail="Entire appointment log" tone="violet" />
      </section>

      <Panel title="Completed queue" description="Appointments that have already been closed">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
          rows={appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patient?.name || 'Unknown'}</td>
              <td>{appointment.doctor?.name || 'Unassigned'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.mode}</td>
              <td>{appointment.reason}</td>
              <td>
                <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="No completed appointments yet."
        />
      </Panel>
    </div>
  )
}

function AdminPrescriptionsPage() {
  const { state } = useMediConnect()

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Records"
        title="Prescriptions"
        description="Every prescription entry stored with the visit history."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiClipboard} label="Prescriptions" value={state.records.length} detail="All stored prescriptions" tone="green" />
        <MetricCard icon={FiFileText} label="Medical records" value={state.records.length} detail="Linked care notes" tone="blue" />
        <MetricCard icon={FiUsers} label="Patients covered" value={state.patients.length} detail="Registered patients" tone="violet" />
        <MetricCard icon={FiActivity} label="Doctors involved" value={state.doctors.length} detail="Clinician accounts" tone="amber" />
      </section>

      <Panel title="Prescription log" description="The latest prescriptions issued by doctors">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Prescription', 'Type']}
          rows={state.records.map((record) => (
            <tr key={record.id}>
              <td>{record.patient?.name || 'Unknown'}</td>
              <td>{record.doctor?.name || 'Unknown'}</td>
              <td>{record.date}</td>
              <td>{record.prescription}</td>
              <td>{record.type}</td>
            </tr>
          ))}
          emptyMessage="No prescriptions have been created yet."
        />
      </Panel>
    </div>
  )
}

function AdminDocumentsPage() {
  const { state } = useMediConnect()

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Records"
        title="Reports and documents"
        description="A compact document-style view of the notes that have already been stored."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiFileText} label="Documents" value={state.records.length} detail="Available files" tone="blue" />
        <MetricCard icon={FiClipboard} label="Prescriptions" value={state.records.length} detail="Linked medication notes" tone="green" />
        <MetricCard icon={FiBell} label="Recent activity" value={state.appointments.filter((appointment) => appointment.status === 'Pending').length} detail="Still in queue" tone="amber" />
        <MetricCard icon={FiActivity} label="Records archive" value={state.records.length} detail="Historical case notes" tone="violet" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Document cards" description="Each card represents a record or report already stored in the system">
          <div className="portal-record-grid">
            {state.records.map((record) => (
              <article className="portal-record-card" key={record.id}>
                <div className="portal-record-card__top">
                  <div>
                    <span>{record.type}</span>
                    <strong>{record.title}</strong>
                  </div>
                  <StatusPill tone={getToneForStatus('Completed')}>Archived</StatusPill>
                </div>
                <p>{record.summary}</p>
                <div className="portal-record-card__meta">
                  <span>
                    Patient: <strong>{record.patient?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Doctor: <strong>{record.doctor?.name || 'Unknown'}</strong>
                  </span>
                  <span>
                    Date: <strong>{record.date}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Document overview" description="A high level snapshot of what is stored in the records area">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Medical notes stay tied to the visit</strong>
              <p>Each record remains linked to the patient and doctor who created it.</p>
            </article>
            <article className="portal-note">
              <strong>Prescriptions are stored with the case</strong>
              <p>The prescription text is saved alongside the summary for easy follow-up.</p>
            </article>
            <article className="portal-note">
              <strong>Documents update automatically</strong>
              <p>When the backend adds new records, this page picks them up on refresh.</p>
            </article>
          </div>
        </Panel>
      </section>
    </div>
  )
}

function AdminLiveConsultationsPage() {
  const { state } = useMediConnect()
  const liveAppointments = state.appointments.filter(
    (appointment) => appointment.status === 'Confirmed' && String(appointment.mode).toLowerCase() === 'online',
  )

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Telemedicine"
        title="Live consultations"
        description="Online consultations that are active or ready to start soon."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiVideo} label="Live consultations" value={liveAppointments.length} detail="Online and confirmed" tone="green" />
        <MetricCard icon={FiBell} label="Pending online" value={state.appointments.filter((appointment) => appointment.status === 'Pending').length} detail="Waiting for approval" tone="amber" />
        <MetricCard icon={FiCalendar} label="Completed" value={state.appointments.filter((appointment) => appointment.status === 'Completed').length} detail="Finished sessions" tone="blue" />
        <MetricCard icon={FiActivity} label="All visits" value={state.appointments.length} detail="Complete consult log" tone="violet" />
      </section>

      <Panel title="Live session queue" description="Confirmed video consultations ready for the telemedicine room">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
          rows={liveAppointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patient?.name || 'Unknown'}</td>
              <td>{appointment.doctor?.name || 'Unassigned'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.mode}</td>
              <td>{appointment.reason}</td>
              <td>
                <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="No live consultations are active right now."
        />
      </Panel>
    </div>
  )
}

function AdminConsultationHistoryPage() {
  const { state } = useMediConnect()
  const history = state.appointments.filter((appointment) =>
    ['Completed', 'Cancelled'].includes(appointment.status),
  )

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Telemedicine"
        title="Consultation history"
        description="A complete record of finished or cancelled consultations."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiCalendar} label="Completed" value={state.appointments.filter((appointment) => appointment.status === 'Completed').length} detail="Finished calls" tone="green" />
        <MetricCard icon={FiBell} label="Cancelled" value={state.appointments.filter((appointment) => appointment.status === 'Cancelled').length} detail="Removed sessions" tone="rose" />
        <MetricCard icon={FiVideo} label="Online history" value={state.appointments.filter((appointment) => String(appointment.mode).toLowerCase() === 'online').length} detail="Telemedicine visits" tone="blue" />
        <MetricCard icon={FiActivity} label="Total history" value={history.length} detail="Closed consultation log" tone="violet" />
      </section>

      <Panel title="Consultation history" description="The archive of finished telemedicine and in-clinic visits">
        <Table
          columns={['Patient', 'Doctor', 'Date', 'Time', 'Mode', 'Reason', 'Status']}
          rows={history.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.patient?.name || 'Unknown'}</td>
              <td>{appointment.doctor?.name || 'Unassigned'}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.mode}</td>
              <td>{appointment.reason}</td>
              <td>
                <StatusPill tone={getToneForStatus(appointment.status)}>{appointment.status}</StatusPill>
              </td>
            </tr>
          ))}
          emptyMessage="No finished consultations yet."
        />
      </Panel>
    </div>
  )
}

function AdminNotificationsPage() {
  const { state } = useMediConnect()
  const pendingDoctors = state.doctors.filter(
    (doctor) => String(doctor.status || '').toLowerCase() !== 'active',
  )
  const pendingAppointments = state.appointments.filter((appointment) => appointment.status === 'Pending')
  const unassignedPatients = state.patients.filter((patient) => !patient.assignedDoctorId)

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="System"
        title="Notifications"
        description="Current alerts pulled from the live clinic data."
      />

      <section className="portal-metric-grid portal-metric-grid--compact">
        <MetricCard icon={FiBell} label="Pending appointments" value={pendingAppointments.length} detail="Need response" tone="amber" />
        <MetricCard icon={FiUsers} label="Unassigned patients" value={unassignedPatients.length} detail="Need a doctor" tone="blue" />
        <MetricCard icon={FiUser} label="Doctor reviews" value={pendingDoctors.length} detail="Need approval" tone="violet" />
        <MetricCard icon={FiActivity} label="Records" value={state.records.length} detail="Stored securely" tone="green" />
      </section>

      <section className="portal-grid portal-grid--two">
        <Panel title="Active alerts" description="Things the admin team should review now">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Appointments waiting for action</strong>
              <p>{pendingAppointments.length} appointment(s) are still marked pending.</p>
            </article>
            <article className="portal-note">
              <strong>Patients waiting on assignment</strong>
              <p>{unassignedPatients.length} patient(s) need a doctor linked to their profile.</p>
            </article>
            <article className="portal-note">
              <strong>Doctors waiting on review</strong>
              <p>{pendingDoctors.length} doctor account(s) are not fully active yet.</p>
            </article>
          </div>
        </Panel>

        <Panel title="Latest changes" description="A quick snapshot of the most recent live items">
          <Table
            columns={['Item', 'Count', 'Status']}
            rows={[
              <tr key="appointments">
                <td>Pending appointments</td>
                <td>{pendingAppointments.length}</td>
                <td>
                  <StatusPill tone="amber">Needs attention</StatusPill>
                </td>
              </tr>,
              <tr key="patients">
                <td>Unassigned patients</td>
                <td>{unassignedPatients.length}</td>
                <td>
                  <StatusPill tone="blue">Review queue</StatusPill>
                </td>
              </tr>,
              <tr key="doctors">
                <td>Doctor approvals</td>
                <td>{pendingDoctors.length}</td>
                <td>
                  <StatusPill tone="violet">Admin review</StatusPill>
                </td>
              </tr>,
            ]}
            emptyMessage="No alerts right now."
          />
        </Panel>
      </section>
    </div>
  )
}

function AdminProfilePage() {
  const { state } = useMediConnect()

  return (
    <div className="portal-page">
      <SectionHeader
        eyebrow="Profile"
        title="Admin profile"
        description="The admin account that controls the MediConnect dashboard."
      />

      <section className="portal-grid portal-grid--two">
        <Panel title="Account summary" description="The administrator login and stored metadata">
          <div className="portal-profile-grid">
            <div className="portal-credential-card">
              <span>Name</span>
              <strong>{state.admin?.name}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Email</span>
              <strong>{state.admin?.email}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Title</span>
              <strong>{state.admin?.title}</strong>
            </div>
            <div className="portal-credential-card">
              <span>Credential status</span>
              <strong>{state.admin?.credentialStatus || 'Stored securely'}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Control notes" description="What this admin account can manage">
          <div className="portal-notes">
            <article className="portal-note">
              <strong>Doctors</strong>
              <p>Create accounts, set treatment areas, and share temporary passwords.</p>
            </article>
            <article className="portal-note">
              <strong>Patients</strong>
              <p>Review patient registrations and their assigned clinicians.</p>
            </article>
            <article className="portal-note">
              <strong>Clinic data</strong>
              <p>Appointments, records, prescriptions, and reports are all visible here.</p>
            </article>
          </div>

          <Link className="portal-button portal-button--ghost" to="/admin/doctors">
            Open doctor manager
          </Link>
        </Panel>
      </section>
    </div>
  )
}

export {
  AdminConsultationHistoryPage,
  AdminAppointmentsPage,
  AdminDashboardPage,
  AdminDoctorsPage,
  AdminDoctorApprovalsPage,
  AdminDocumentsPage,
  AdminPatientsPage,
  AdminPatientRecordsPage,
  AdminRecordsPage,
  AdminPendingAppointmentsPage,
  AdminCompletedAppointmentsPage,
  AdminPrescriptionsPage,
  AdminReportsPage,
  AdminLiveConsultationsPage,
  AdminNotificationsPage,
  AdminProfilePage,
  AdminSettingsPage,
}
