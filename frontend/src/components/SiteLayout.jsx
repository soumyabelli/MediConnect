import { Link, NavLink, Outlet } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'
import BrandMark from './BrandMark'

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Features', to: '/features' },
  { label: 'Contact Us', to: '/contact' },
]

export default function SiteLayout() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="MediConnect home">
          <BrandMark />
          <span className="brand-copy">
            <span className="brand-copy__name">MediConnect</span>
            <span className="brand-copy__tag">Telemedicine &amp; EHR System</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {navItems.map(({ label, to, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link className="login-button" to="/login">
          <FiUser aria-hidden="true" />
          <span>Login</span>
        </Link>
      </header>

      <Outlet />
    </div>
  )
}
