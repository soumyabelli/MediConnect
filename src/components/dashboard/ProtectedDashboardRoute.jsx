import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMediConnect } from '../../context/MediConnectContext'

export default function ProtectedDashboardRoute({ role }) {
  const location = useLocation()
  const { session } = useMediConnect()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const allowedRoles = Array.isArray(role) ? role : [role]
  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={`/${allowedRoles[0] || session.role}`} replace />
  }

  return <Outlet />
}
