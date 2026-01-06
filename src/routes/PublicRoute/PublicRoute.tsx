import { Navigate, Outlet } from 'react-router'
import { useAppSelector } from '@/hooks'
import { userSelector } from '@/store'

export const PublicRoute = () => {
  const { accessToken, userData } = useAppSelector(userSelector)
  const isAuthenticated = !!(accessToken && userData)

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
