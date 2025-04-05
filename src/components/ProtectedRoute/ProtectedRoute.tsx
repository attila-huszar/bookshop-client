import { Navigate, Outlet, useLoaderData } from 'react-router'

export function ProtectedRoute() {
  const isUserLoggedIn = useLoaderData<boolean>()

  return isUserLoggedIn ? <Outlet /> : <Navigate to={'/'} replace />
}
