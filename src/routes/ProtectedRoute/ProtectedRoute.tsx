import { Navigate, Outlet, useLoaderData } from 'react-router'
import { userSelector } from '@/store/selectors'
import { useAppSelector } from '@/hooks/redux'
import { UserRole } from '@/types'

export function ProtectedRoute({ adminRequired = false }) {
  const allowedByLoader = useLoaderData<boolean>()
  const { accessToken, userData } = useAppSelector(userSelector)
  const isAuthenticated =
    allowedByLoader &&
    accessToken &&
    (!adminRequired || userData?.role === UserRole.Admin)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
