import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiCalendar,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { useMediConnect } from '../../context/MediConnectContext'
import { getDoctorById } from '../../lib/mediconnectStore'
import BrandMark from '../BrandMark'
import doctorAvatar from '../../assets/women doctor.png'

const navItems = [
  { label: 'Dashboard', to: '/doctor', icon: FiGrid },
  { label: 'Appointments', to: '/doctor/appointments', icon: FiCalendar },
  { label: 'Patients', to: '/doctor/patients', icon: FiUsers },
  { label: 'Prescriptions', to: '/doctor/prescriptions', icon: FiFileText },
  { label: 'Records', to: '/doctor/records', icon: FiFileText },
  { label: 'Profile', to: '/doctor/profile', icon: FiUser },
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
            </NavLink>
          ))}
        </nav>

        <div className="doc-sidebar-footer">
          <div className="doc-profile-card">
            <img src={doctorAvatar} alt="Doctor profile" className="doc-profile-img" />
            <div className="doc-profile-info">
              <strong>{doctor?.name || 'Doctor'}</strong>
              <span>{doctor?.specialization || 'Specialist'}</span>
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

      <div className="doc-main">
        <header className="doc-topbar">
          <div className="doc-topbar-left">
            <button className="doc-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FiMenu />
            </button>
            <div className="doc-topbar-titles">
              <h1>Doctor Dashboard</h1>
              <p>Welcome back, {doctor?.name || 'Doctor'}</p>
            </div>
          </div>

          <div className="doc-topbar-right">
            <div className="doc-search-box">
              <FiSearch className="doc-search-icon" />
              <input type="text" placeholder="Search patients, appointments..." />
            </div>

            <img src={doctorAvatar} alt="Doctor profile top" className="doc-topbar-avatar" />
          </div>
        </header>

        <main className="doc-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
