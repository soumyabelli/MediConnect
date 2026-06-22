import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiBell,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUser,
  FiUsers,
  FiCalendar,
  FiActivity,
  FiVideo,
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import { getDoctorById, getPatientById } from '../../lib/mediconnectStore'

const roleConfig = {
  admin: {
    label: 'Admin Dashboard',
    subtitle: 'Clinic operations, staff access, and patient records',
    accent: 'blue',
    initial: 'A',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { label: 'Overview', to: '/admin', icon: FiGrid },
        ],
      },
      {
        title: 'Doctors',
        items: [
          { label: 'All Doctors', to: '/admin/doctors', icon: FiUsers },
          { label: 'Add Doctor', action: 'scroll', target: 'add-doctor', icon: FiUser },
          { label: 'Doctor Approvals', to: '/admin/doctors/approvals', icon: FiClipboard },
        ],
      },
      {
        title: 'Patients',
        items: [
          { label: 'All Patients', to: '/admin/patients', icon: FiUser },
          { label: 'Patient Records', to: '/admin/patients/records', icon: FiFileText },
        ],
      },
      {
        title: 'Appointments',
        items: [
          { label: 'All Appointments', to: '/admin/appointments', icon: FiCalendar },
          { label: 'Pending Appointments', to: '/admin/appointments/pending', icon: FiBell },
          { label: 'Completed Appointments', to: '/admin/appointments/completed', icon: FiClipboard },
        ],
      },
      {
        title: 'Electronic Health Records',
        items: [
          { label: 'Medical Records', to: '/admin/records/medical', icon: FiFileText },
          { label: 'Prescriptions', to: '/admin/records/prescriptions', icon: FiClipboard },
          { label: 'Reports & Documents', to: '/admin/records/documents', icon: FiActivity },
        ],
      },
      {
        title: 'Telemedicine',
        items: [
          { label: 'Live Consultations', to: '/admin/telemedicine/live', icon: FiVideo },
          { label: 'Consultation History', to: '/admin/telemedicine/history', icon: FiCalendar },
        ],
      },
      {
        title: 'Reports & Analytics',
        items: [
          { label: 'Reports & Analytics', to: '/admin/reports', icon: FiActivity },
        ],
      },
      {
        title: 'Notifications',
        items: [
          { label: 'Notifications', to: '/admin/notifications', icon: FiBell },
        ],
      },
      {
        title: 'Settings',
        items: [
          { label: 'Settings', to: '/admin/settings', icon: FiSettings },
        ],
      },
      {
        title: 'Profile',
        items: [
          { label: 'Profile', to: '/admin/profile', icon: FiUser },
        ],
      },
    ],
  },
  doctor: {
    label: 'Doctor Dashboard',
    subtitle: 'Patient care, schedules, and medical notes',
    accent: 'teal',
    initial: 'D',
    sections: [
      {
        title: 'Clinic',
        items: [
          { label: 'Dashboard', to: '/doctor', icon: FiGrid },
          { label: 'My Patients', to: '/doctor/patients', icon: FiUsers },
          { label: 'Schedule', to: '/doctor/schedule', icon: FiCalendar },
        ],
      },
      {
        title: 'Care',
        items: [
          { label: 'Records', to: '/doctor/records', icon: FiFileText },
          { label: 'Profile', to: '/doctor/profile', icon: FiUser },
        ],
      },
    ],
  },
  patient: {
    label: 'Patient Dashboard',
    subtitle: 'Appointments, prescriptions, and follow-up care',
    accent: 'rose',
    initial: 'P',
    sections: [
      {
        title: 'My Portal',
        items: [
          { label: 'Dashboard', to: '/patient', icon: FiGrid },
          { label: 'Appointments', to: '/patient/appointments', icon: FiCalendar },
          { label: 'Records', to: '/patient/records', icon: FiFileText },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Profile', to: '/patient/profile', icon: FiUser },
        ],
      },
    ],
  },
}

function getCurrentAccount(state, session) {
  if (!session) {
    return null
  }

  if (session.role === 'admin') {
    return state.admin
  }

  if (session.role === 'doctor') {
    return getDoctorById(state, session.userId)
  }

  if (session.role === 'patient') {
    return getPatientById(state, session.userId)
  }

  return null
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { state, session, logout } = useMediConnect()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const config = roleConfig[session?.role] || roleConfig.admin
  const account = getCurrentAccount(state, session)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleSidebarAction = (item) => {
    if (item.action === 'scroll' && item.target) {
      setSidebarOpen(false)

      window.requestAnimationFrame(() => {
        document.getElementById(item.target)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  }

  return (
    <div className={`portal-shell portal-shell--${config.accent}`}>
      <aside className={`portal-sidebar ${sidebarOpen ? 'portal-sidebar--open' : ''}`}>
        <div className="portal-sidebar__brand">
          <div className="portal-sidebar__mark">M</div>
          <div>
            <strong>MediConnect</strong>
            <span>{config.label}</span>
          </div>
        </div>

        <nav className="portal-sidebar__nav" aria-label="Dashboard navigation">
          {config.sections.map((section) => (
            <section className="portal-nav-group" key={section.title}>
              <h2>{section.title}</h2>
              <div className="portal-nav-list">
                {section.items.map((item) => (
                  item.action === 'scroll' ? (
                    <button
                      key={item.label}
                      type="button"
                      className="portal-nav-link portal-nav-link--button"
                      onClick={() => handleSidebarAction(item)}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === `/${session?.role}`}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        isActive ? 'portal-nav-link portal-nav-link--active' : 'portal-nav-link'
                      }
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                ))}
              </div>
            </section>
          ))}
        </nav>

        <button type="button" className="portal-logout" onClick={handleLogout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </aside>

      <div className={`portal-overlay ${sidebarOpen ? 'portal-overlay--show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="portal-main">
        <header className="portal-topbar">
          <button type="button" className="portal-menu-button" onClick={() => setSidebarOpen((current) => !current)}>
            <FiMenu aria-hidden="true" />
          </button>

          <div className="portal-topbar__copy">
            <span className="portal-eyebrow">{config.label}</span>
            <strong>{account?.name || 'MediConnect user'}</strong>
            <p>{config.subtitle}</p>
          </div>

          <div className="portal-topbar__tools">
            <label className="portal-search" aria-label="Search">
              <FiSearch aria-hidden="true" />
              <input type="search" placeholder="Search anything..." />
            </label>

            <button type="button" className="portal-icon-button" aria-label="Notifications">
              <FiBell aria-hidden="true" />
              <span className="portal-badge">5</span>
            </button>

            <div className="portal-user-chip">
              <span className="portal-user-chip__avatar">{config.initial}</span>
              <div>
                <strong>{account?.name || 'MediConnect'}</strong>
                <span>{session?.role || 'guest'}</span>
              </div>
              <FiChevronDown aria-hidden="true" />
            </div>
          </div>
        </header>

        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
