import { Navigate, Outlet, useLoaderData } from 'react-router-dom'

export function ProtectedRoutes() {
  const isUserLoggedIn = useLoaderData()

  return isUserLoggedIn ? <Outlet /> : <Navigate to={'/'} replace />
}
