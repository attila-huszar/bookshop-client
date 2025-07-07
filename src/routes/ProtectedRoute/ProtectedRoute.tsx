import { Navigate, Outlet } from 'react-router'
import { useAppSelector } from '@/hooks'
import { USER_ROLE } from '@/types'

export function ProtectedRoute({ adminRequired = false }) {
  const isAuthenticated = useAppSelector((state) => state.user.accessToken)
  const isAdmin =
    useAppSelector((state) => state.user.userData?.role) === USER_ROLE.ADMIN

  if (adminRequired) {
    if (isAuthenticated && isAdmin) return <Outlet />
    return <Navigate to="/login" replace />
  }

  if (isAuthenticated) return <Outlet />
  return <Navigate to="/login" replace />
}
