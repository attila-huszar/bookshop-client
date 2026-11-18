import { Navigate, Outlet } from 'react-router'
import { ROUTE } from '@/routes/route'
import { userSelector } from '@/store/selectors'
import { useAppSelector } from '@/hooks/redux'

export const PublicRoute = () => {
  const { accessToken, userData, userIsLoading } = useAppSelector(userSelector)
  const shouldRedirect = !userIsLoading && Boolean(accessToken && userData)

  return shouldRedirect ? <Navigate to={ROUTE.HOME} replace /> : <Outlet />
}
