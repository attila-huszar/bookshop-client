import { Navigate, Outlet, useLoaderData } from 'react-router'

export function ProtectedRoute() {
  const isUserLoggedIn = useLoaderData<unknown>()

  return isUserLoggedIn ? <Outlet /> : <Navigate to={'/'} replace />
}
