import { Suspense, lazy } from 'react'
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router'
import { ErrorBoundary } from 'react-error-boundary'
import {
  Home,
  Products,
  Product,
  Registration,
  Login,
  Cart,
  Account,
  Checkout,
  NotFound,
  CMS,
} from '@/pages'
import { ROUTE } from './route'
import { Loading, VerifyEmail, PasswordReset, Error } from '@/components'
import { PublicRoute } from './PublicRoute/PublicRoute'
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute'
import { authLoader } from './loaders/authLoader'

const Layout = lazy(() =>
  import('../pages/Layout/Layout').then(({ Layout }) => ({
    default: Layout,
  })),
)

const routes: RouteObject[] = [
  {
    path: ROUTE.HOME,
    errorElement: <Error fullScreen />,
    loader: authLoader,
    element: (
      <ErrorBoundary fallback={<Error fullScreen />}>
        <Suspense fallback={<Loading fullScreen />}>
          <Layout />
        </Suspense>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: ROUTE.BOOKS, element: <Products /> },
      { path: ROUTE.BOOK, element: <Product /> },
      { path: ROUTE.CART, element: <Cart /> },
      { path: ROUTE.VERIFICATION, element: <VerifyEmail /> },
      { path: ROUTE.PASSWORD_RESET, element: <PasswordReset /> },
      {
        element: <PublicRoute />,
        children: [
          { path: ROUTE.REGISTER, element: <Registration /> },
          { path: ROUTE.LOGIN, element: <Login /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: ROUTE.ACCOUNT, element: <Account /> }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: ROUTE.CHECKOUT, element: <Checkout /> },
  {
    element: <ProtectedRoute adminRequired />,
    loader: authLoader,
    children: [{ path: ROUTE.CMS, element: <CMS /> }],
  },
]

const router = createBrowserRouter(routes)

export const Routes: React.FC = () => {
  return <RouterProvider router={router} />
}
