import { Link } from 'react-router-dom'
import { FiActivity, FiCalendar, FiFileText, FiUsers, FiVideo, FiCheckCircle, FiEdit3, FiUpload, FiClipboard, FiClock } from 'react-icons/fi'
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

  // Format data
  const appointmentsCount = overview.appointments.length
  const totalPatients = overview.patients.length
  const todayAppointments = overview.appointments.slice(0, 4)
  
  return (
    <div className="doc-dashboard-grid">
      {/* Metric Cards */}
      <div className="doc-dashboard-full">
        <div className="doc-metrics-row">
          <div className="doc-metric-card">
            <div className="doc-metric-icon blue"><FiCalendar /></div>
            <div className="doc-metric-info">
              <span className="doc-metric-label">Today's Appointments</span>
              <span className="doc-metric-value">{appointmentsCount > 0 ? appointmentsCount : 8}</span>
              <a href="/doctor/appointments" className="doc-metric-detail link">View today's schedule &rarr;</a>
            </div>
          </div>
          <div className="doc-metric-card">
            <div className="doc-metric-icon green"><FiUsers /></div>
            <div className="doc-metric-info">
              <span className="doc-metric-label">Total Patients</span>
              <span className="doc-metric-value">{totalPatients > 0 ? totalPatients : 342}</span>
              <span className="doc-metric-detail positive">+12 this month</span>
            </div>
          </div>
          <div className="doc-metric-card">
            <div className="doc-metric-icon purple"><FiVideo /></div>
            <div className="doc-metric-info">
              <span className="doc-metric-label">Consultations Today</span>
              <span className="doc-metric-value">5</span>
              <span className="doc-metric-detail" style={{color: '#a855f7'}}>2 upcoming</span>
            </div>
          </div>
          <div className="doc-metric-card">
            <div className="doc-metric-icon orange"><FiFileText /></div>
            <div className="doc-metric-info">
              <span className="doc-metric-label">Prescriptions Issued</span>
              <span className="doc-metric-value">12</span>
              <a href="/doctor/prescriptions" className="doc-metric-detail link">View all prescriptions &rarr;</a>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments Table */}
      <div className="doc-panel" style={{gridColumn: '1 / 2'}}>
        <div className="doc-panel-header">
          <h2 className="doc-panel-title">Today's Appointments</h2>
          <Link to="/doctor/schedule" className="doc-panel-action">View full schedule &rarr;</Link>
        </div>
        <table className="doc-table">
          <tbody>
            <tr>
              <td className="doc-time-cell">09:00 AM</td>
              <td>
                <div className="doc-patient-cell">
                  <div className="doc-patient-avatar">PS</div>
                  <div className="doc-patient-info">
                    <span className="doc-patient-name">Priya Sharma</span>
                    <span className="doc-patient-meta">32 • Female</span>
                  </div>
                </div>
              </td>
              <td className="doc-condition-cell">Regular Checkup</td>
              <td><span className="doc-pill completed">Completed</span></td>
              <td><button className="doc-action-btn outline">View Notes</button></td>
            </tr>
            <tr>
              <td className="doc-time-cell">10:00 AM</td>
              <td>
                <div className="doc-patient-cell">
                  <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704d')`, backgroundSize: 'cover'}}></div>
                  <div className="doc-patient-info">
                    <span className="doc-patient-name">Rahul Mehta</span>
                    <span className="doc-patient-meta">45 • Male</span>
                  </div>
                </div>
              </td>
              <td className="doc-condition-cell">Chest Pain</td>
              <td><span className="doc-pill in-consultation">In Consultation</span></td>
              <td><button className="doc-action-btn primary"><FiVideo /> Join Room</button></td>
            </tr>
            <tr>
              <td className="doc-time-cell">11:00 AM</td>
              <td>
                <div className="doc-patient-cell">
                  <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704a')`, backgroundSize: 'cover'}}></div>
                  <div className="doc-patient-info">
                    <span className="doc-patient-name">Anita Desai</span>
                    <span className="doc-patient-meta">60 • Female</span>
                  </div>
                </div>
              </td>
              <td className="doc-condition-cell">Follow-up</td>
              <td><span className="doc-pill upcoming">Upcoming</span></td>
              <td><button className="doc-action-btn outline"><FiVideo /> Start</button></td>
            </tr>
            <tr>
              <td className="doc-time-cell">12:00 PM</td>
              <td>
                <div className="doc-patient-cell">
                  <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704b')`, backgroundSize: 'cover'}}></div>
                  <div className="doc-patient-info">
                    <span className="doc-patient-name">Vikram Patel</span>
                    <span className="doc-patient-meta">38 • Male</span>
                  </div>
                </div>
              </td>
              <td className="doc-condition-cell">ECG Review</td>
              <td><span className="doc-pill upcoming">Upcoming</span></td>
              <td><button className="doc-action-btn outline"><FiVideo /> Start</button></td>
            </tr>
            <tr>
              <td className="doc-time-cell">02:00 PM</td>
              <td>
                <div className="doc-patient-cell">
                  <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704c')`, backgroundSize: 'cover'}}></div>
                  <div className="doc-patient-info">
                    <span className="doc-patient-name">Neha Singh</span>
                    <span className="doc-patient-meta">29 • Female</span>
                  </div>
                </div>
              </td>
              <td className="doc-condition-cell">Migraine</td>
              <td><span className="doc-pill upcoming">Upcoming</span></td>
              <td><button className="doc-action-btn outline"><FiVideo /> Start</button></td>
            </tr>
          </tbody>
        </table>
        <div style={{textAlign: 'center', marginTop: '16px'}}>
          <Link to="/doctor/appointments" className="doc-panel-action" style={{justifyContent: 'center'}}>View all appointments &rarr;</Link>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="doc-panel">
        <div className="doc-panel-header">
          <h2 className="doc-panel-title">Today's Schedule</h2>
          <span style={{fontSize: '0.85rem', color: '#6b7280', fontWeight: '500'}}>May 26, 2025 &lt; &gt;</span>
        </div>
        <div className="doc-timeline">
          <div className="doc-timeline-item">
            <div className="doc-timeline-time">09:00 AM</div>
            <div className="doc-timeline-marker">
              <div className="doc-timeline-dot"></div>
              <div className="doc-timeline-line"></div>
            </div>
            <div className="doc-timeline-content">
              <div>
                <div className="doc-patient-name">Priya Sharma</div>
                <div className="doc-condition-cell">Regular Checkup</div>
              </div>
              <span className="doc-metric-detail positive" style={{fontWeight: '500'}}>Completed</span>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-time" style={{color: '#3b82f6'}}>10:00 AM</div>
            <div className="doc-timeline-marker">
              <div className="doc-timeline-dot active"></div>
              <div className="doc-timeline-line"></div>
            </div>
            <div className="doc-timeline-content active">
              <div>
                <div className="doc-patient-name">Rahul Mehta</div>
                <div className="doc-condition-cell">Chest Pain</div>
              </div>
              <span className="doc-metric-detail link" style={{fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px'}}>In Consultation <FiVideo/></span>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-time">11:00 AM</div>
            <div className="doc-timeline-marker">
              <div className="doc-timeline-dot upcoming"></div>
              <div className="doc-timeline-line"></div>
            </div>
            <div className="doc-timeline-content">
              <div>
                <div className="doc-patient-name">Anita Desai</div>
                <div className="doc-condition-cell">Follow-up</div>
              </div>
              <span className="doc-metric-detail" style={{color: '#a855f7', fontWeight: '500'}}>Upcoming</span>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-time">12:00 PM</div>
            <div className="doc-timeline-marker">
              <div className="doc-timeline-dot upcoming"></div>
              <div className="doc-timeline-line"></div>
            </div>
            <div className="doc-timeline-content">
              <div>
                <div className="doc-patient-name">Vikram Patel</div>
                <div className="doc-condition-cell">ECG Review</div>
              </div>
              <span className="doc-metric-detail" style={{color: '#a855f7', fontWeight: '500'}}>Upcoming</span>
            </div>
          </div>
          <div className="doc-timeline-item">
            <div className="doc-timeline-time">02:00 PM</div>
            <div className="doc-timeline-marker">
              <div className="doc-timeline-dot upcoming"></div>
              <div className="doc-timeline-line"></div>
            </div>
            <div className="doc-timeline-content">
              <div>
                <div className="doc-patient-name">Neha Singh</div>
                <div className="doc-condition-cell">Migraine</div>
              </div>
              <span className="doc-metric-detail" style={{color: '#a855f7', fontWeight: '500'}}>Upcoming</span>
            </div>
          </div>
        </div>
        <div style={{textAlign: 'center', marginTop: '24px'}}>
          <Link to="/doctor/schedule" className="doc-panel-action" style={{justifyContent: 'center'}}>View full schedule &rarr;</Link>
        </div>
      </div>

      <div className="doc-dashboard-row doc-dashboard-full">
        {/* Recent Patients */}
        <div className="doc-panel">
          <div className="doc-panel-header">
            <h2 className="doc-panel-title">Recent Patients</h2>
            <Link to="/doctor/patients" className="doc-panel-action">View all &rarr;</Link>
          </div>
          <div className="doc-task-list">
            <div className="doc-patient-cell" style={{justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6'}}>
              <div className="doc-patient-cell">
                <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704d')`, backgroundSize: 'cover'}}></div>
                <div className="doc-patient-info">
                  <span className="doc-patient-name">Rahul Mehta</span>
                  <span className="doc-patient-meta">45 • Male</span>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span className="doc-patient-meta">May 24, 2025</span>
                <button className="doc-action-btn outline" style={{padding: '6px', borderRadius: '4px'}}><FiFileText/></button>
              </div>
            </div>
            <div className="doc-patient-cell" style={{justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6'}}>
              <div className="doc-patient-cell">
                <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704a')`, backgroundSize: 'cover'}}></div>
                <div className="doc-patient-info">
                  <span className="doc-patient-name">Anita Desai</span>
                  <span className="doc-patient-meta">60 • Female</span>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span className="doc-patient-meta">May 23, 2025</span>
                <button className="doc-action-btn outline" style={{padding: '6px', borderRadius: '4px'}}><FiFileText/></button>
              </div>
            </div>
            <div className="doc-patient-cell" style={{justifyContent: 'space-between'}}>
              <div className="doc-patient-cell">
                <div className="doc-patient-avatar" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=a042581f4e29026704b')`, backgroundSize: 'cover'}}></div>
                <div className="doc-patient-info">
                  <span className="doc-patient-name">Vikram Patel</span>
                  <span className="doc-patient-meta">38 • Male</span>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <span className="doc-patient-meta">May 22, 2025</span>
                <button className="doc-action-btn outline" style={{padding: '6px', borderRadius: '4px'}}><FiFileText/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="doc-panel">
          <div className="doc-panel-header">
            <h2 className="doc-panel-title">Pending Tasks</h2>
          </div>
          <div className="doc-task-list">
            <div className="doc-task-item">
              <div className="doc-task-icon red"><FiFileText /></div>
              <div className="doc-task-info">
                <div className="doc-task-title">Review lab reports</div>
                <div className="doc-task-desc">3 reports pending review</div>
              </div>
              <span className="doc-task-priority high">High</span>
            </div>
            <div className="doc-task-item">
              <div className="doc-task-icon yellow"><FiEdit3 /></div>
              <div className="doc-task-info">
                <div className="doc-task-title">Sign prescriptions</div>
                <div className="doc-task-desc">5 prescriptions pending</div>
              </div>
              <span className="doc-task-priority medium">Medium</span>
            </div>
            <div className="doc-task-item">
              <div className="doc-task-icon blue"><FiClipboard /></div>
              <div className="doc-task-info">
                <div className="doc-task-title">Patient follow-ups</div>
                <div className="doc-task-desc">2 follow-ups due today</div>
              </div>
              <span className="doc-task-priority low">Low</span>
            </div>
          </div>
          <div style={{textAlign: 'center', marginTop: '24px'}}>
            <a href="#" className="doc-panel-action" style={{justifyContent: 'center'}}>View all tasks &rarr;</a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="doc-panel">
          <div className="doc-panel-header">
            <h2 className="doc-panel-title">Quick Actions</h2>
          </div>
          <div className="doc-quick-actions">
            <button className="doc-quick-action-btn">
              <FiVideo size={18} /> New Consultation
            </button>
            <button className="doc-quick-action-btn">
              <FiEdit3 size={18} /> Add Prescription
            </button>
            <button className="doc-quick-action-btn">
              <FiFileText size={18} /> Write Medical Note
            </button>
            <button className="doc-quick-action-btn">
              <FiUpload size={18} /> Upload Document
            </button>
            <button className="doc-quick-action-btn full">
              <FiClipboard size={18} /> View Patient Records
            </button>
          </div>
        </div>
      </div>
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
          <EmptyState title="No patient yet" description="Once admin assigns patients to you, their profiles will appear here." />
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
