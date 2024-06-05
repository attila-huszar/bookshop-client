import { Navigate, Outlet, useLoaderData } from 'react-router-dom'

export function ProtectedRoute() {
  const isUserLoggedIn = useLoaderData()

  return isUserLoggedIn ? <Outlet /> : <Navigate to={'/'} replace />
}
