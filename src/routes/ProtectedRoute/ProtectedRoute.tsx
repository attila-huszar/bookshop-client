import { Navigate, Outlet, useLoaderData } from 'react-router'

export function ProtectedRoute() {
  const isAuthenticated = useLoaderData<boolean>()

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
