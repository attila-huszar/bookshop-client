import { Navigate, Outlet, useLoaderData } from 'react-router-dom'

export function ProtectedRoute() {
  const isUserLoggedIn = useLoaderData<unknown>()

  return isUserLoggedIn ? <Outlet /> : <Navigate to={'/'} replace />
}
