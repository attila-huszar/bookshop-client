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
} from '@/pages'
import { PATH } from '@/constants'
import {
  ProtectedRoute,
  Loading,
  VerifyEmail,
  PasswordReset,
  Error,
} from '@/components'
import { protectedRouteLoader } from '@/helpers'

const Layout = lazy(() =>
  import('../pages/Layout/Layout').then(({ Layout }) => ({
    default: Layout,
  })),
)

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ErrorBoundary
        fallback={
          <Error text="Couldn't load the page. Please try again later." />
        }>
        <Suspense fallback={<Loading />}>
          <Layout />
        </Suspense>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: PATH.CLIENT.books,
        element: <Products />,
      },
      {
        path: `${PATH.CLIENT.books}/:id`,
        element: <Product />,
      },
      {
        path: PATH.CLIENT.register,
        element: <Registration />,
      },
      {
        path: PATH.CLIENT.login,
        element: <Login />,
      },
      {
        path: PATH.CLIENT.cart,
        element: <Cart />,
      },
      {
        path: PATH.CLIENT.verification,
        element: <VerifyEmail />,
      },
      {
        path: PATH.CLIENT.passwordReset,
        element: <PasswordReset />,
      },
      {
        element: <ProtectedRoute />,
        loader: protectedRouteLoader,
        children: [
          {
            path: PATH.CLIENT.account,
            element: <Account />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: PATH.CLIENT.checkout,
    element: <Checkout />,
  },
]

const router = createBrowserRouter(routes)

export const Routes: React.FC = () => {
  return <RouterProvider router={router} />
}
