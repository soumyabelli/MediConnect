import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMediConnect } from '../../context/MediConnectContext'

export default function ProtectedDashboardRoute({ role }) {
  const location = useLocation()
  const { session } = useMediConnect()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (session.role !== role) {
    return <Navigate to={`/${session.role}`} replace />
  }

  return <Outlet />
}
