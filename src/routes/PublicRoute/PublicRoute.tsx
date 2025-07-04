import { Navigate, Outlet } from 'react-router'
import { useAppSelector } from '@/hooks'

export const PublicRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.user.accessToken)

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
