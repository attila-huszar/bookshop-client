import { Navigate, Outlet } from 'react-router'
import { useAppSelector } from '@/hooks'

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.accessToken)

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
