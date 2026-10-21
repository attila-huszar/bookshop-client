import { Navigate, Outlet } from 'react-router'
import { userSelector } from '@/store/selectors'
import { useAppSelector } from '@/hooks/redux'

export const PublicRoute = () => {
  const { accessToken, userData } = useAppSelector(userSelector)
  const isAuthenticated = !!(accessToken && userData)

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
