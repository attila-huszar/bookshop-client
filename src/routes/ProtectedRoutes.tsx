import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../hooks'
import { userSelector } from '../store'
import { Loading } from '../components'

export function ProtectedRoutes() {
  const { userData, userIsLoading } = useAppSelector(userSelector)

  if (userIsLoading) {
    return <Loading />
  }

  if (!userData && userIsLoading) {
    return <Navigate to={'/'} replace />
  }

  if (userData) {
    return <Outlet />
  }
}
