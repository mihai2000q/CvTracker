import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function RedirectAuthentication() {
  const location = useLocation()
  const isAuthenticated = useAuth()

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={'login'} state={{ from: location }} replace />
  )
}

export default RedirectAuthentication
