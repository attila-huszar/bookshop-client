import { Navigate, Outlet, useLoaderData } from 'react-router'

export const PublicRoute = () => {
  const isAuthenticated = useLoaderData<boolean>()

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
