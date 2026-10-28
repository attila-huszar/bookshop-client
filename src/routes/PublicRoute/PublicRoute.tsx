import { Navigate, Outlet } from 'react-router'
import { userSelector } from '@/store/selectors'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'

export const PublicRoute = () => {
  const { accessToken, userData, userIsLoading } = useAppSelector(userSelector)
  const isAuthenticated = !!(accessToken && userData)

  if (userIsLoading) {
    return <Loading fullScreen />
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
