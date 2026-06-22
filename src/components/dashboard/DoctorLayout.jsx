import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiVideo,
  FiFileText,
  FiMessageSquare,
  FiPieChart,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiBell,
  FiClock
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import { getDoctorById } from '../../lib/mediconnectStore'
import BrandMark from '../BrandMark'
import doctorAvatar from '../../assets/women doctor.png'

const navItems = [
  { label: 'Dashboard', to: '/doctor', icon: FiGrid },
  { label: 'Appointments', to: '/doctor/appointments', icon: FiCalendar },
  { label: 'Patients', to: '/doctor/patients', icon: FiUsers },
  { label: 'Schedule', to: '/doctor/schedule', icon: FiClock },
  { label: 'Consultations', to: '/doctor/consultations', icon: FiVideo },
  { label: 'EHR / Medical Records', to: '/doctor/records', icon: FiFileText },
  { label: 'Prescriptions', to: '/doctor/prescriptions', icon: FiFileText },
  { label: 'Messages', to: '/doctor/messages', icon: FiMessageSquare, badge: 3 },
  { label: 'Reports & Analytics', to: '/doctor/reports', icon: FiPieChart },
  { label: 'Billing', to: '/doctor/billing', icon: FiCreditCard },
  { label: 'Settings', to: '/doctor/settings', icon: FiSettings },
]

export default function DoctorLayout() {
  const navigate = useNavigate()
  const { state, session, logout } = useMediConnect()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const doctor = session?.role === 'doctor' ? getDoctorById(state, session.userId) : null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="doc-layout">
      {/* Sidebar */}
      <aside className={`doc-sidebar ${sidebarOpen ? 'doc-sidebar--open' : ''}`}>
        <div className="doc-sidebar-header">
          <BrandMark />
          <div className="doc-brand-text">
            <strong>MediConnect</strong>
            <span>Telemedicine & EHR</span>
          </div>
        </div>

        <nav className="doc-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/doctor'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'doc-nav-item doc-nav-item--active' : 'doc-nav-item'
              }
            >
              <item.icon className="doc-nav-icon" />
              <span className="doc-nav-label">{item.label}</span>
              {item.badge && <span className="doc-nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="doc-sidebar-footer">
          <div className="doc-profile-card">
            <img src={doctorAvatar} alt="Doctor profile" className="doc-profile-img" />
            <div className="doc-profile-info">
              <strong>{doctor?.name || 'Dr. Arjun Verma'}</strong>
              <span>{doctor?.specialization || 'Cardiologist'}</span>
              <div className="doc-status-indicator">
                <span className="doc-status-dot"></span> Online
              </div>
            </div>
          </div>
          <button className="doc-logout-btn" onClick={handleLogout}>
            <FiLogOut /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className={`doc-overlay ${sidebarOpen ? 'doc-overlay--show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="doc-main">
        {/* Topbar */}
        <header className="doc-topbar">
          <div className="doc-topbar-left">
            <button className="doc-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
            <div className="doc-topbar-titles">
              <h1>Doctor Dashboard</h1>
              <p>Welcome back, {doctor?.name || 'Dr. Arjun Verma'}</p>
            </div>
          </div>

          <div className="doc-topbar-right">
            <div className="doc-search-box">
              <FiSearch className="doc-search-icon" />
              <input type="text" placeholder="Search patients, appointments..." />
            </div>
            
            <button className="doc-bell-btn">
              <FiBell />
              <span className="doc-bell-badge">2</span>
            </button>

            <img src={doctorAvatar} alt="Doctor profile top" className="doc-topbar-avatar" />
          </div>
        </header>

        {/* Page Content */}
        <main className="doc-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
