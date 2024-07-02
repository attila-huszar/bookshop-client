import { Suspense, lazy } from 'react'
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
} from 'pages'
import { PATH } from 'lib'
import { ProtectedRoute, Loading, VerifyEmail, PasswordReset } from 'components'
import { protectedRouteLoader } from 'helpers'

const Layout = lazy(() =>
  import('../pages/Layout/Layout').then(({ Layout }) => ({
    default: Layout,
  })),
)

export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: PATH.books,
        element: <Products />,
      },
      {
        path: `${PATH.books}/:id`,
        element: <Product />,
      },
      {
        path: PATH.registration,
        element: <Registration />,
      },
      {
        path: PATH.login,
        element: <Login />,
      },
      {
        path: PATH.cart,
        element: <Cart />,
      },
      {
        path: PATH.verify,
        element: <VerifyEmail />,
      },
      {
        path: PATH.passwordReset,
        element: <PasswordReset />,
      },
      {
        element: <ProtectedRoute />,
        loader: protectedRouteLoader,
        children: [
          {
            path: PATH.account,
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
    path: PATH.checkout,
    element: <Checkout />,
  },
]
