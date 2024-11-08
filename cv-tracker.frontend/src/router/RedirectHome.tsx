import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function RedirectHome() {
  const isAuthenticated = useAuth()
  return isAuthenticated ? <Navigate to={'home'} replace /> : <Outlet />
}

export default RedirectHome
