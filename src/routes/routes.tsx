import { Suspense, lazy } from 'react'
import {
  Home,
  Products,
  Product,
  Registration,
  Login,
  Cart,
  Account,
  NotFound,
} from '../pages'
import { BOOKS, REGISTRATION, LOGIN, CART, ACCOUNT } from './pathConstants'
import { ProtectedRoutes } from '../routes/ProtectedRoutes'
import { protectedRouteLoader } from '../utils/protectedRouteLoader'
import { Loading } from '../components'

const Layout = lazy(() =>
  import('../pages').then(({ Layout }) => ({
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
        path: BOOKS,
        element: <Products />,
      },
      {
        path: `${BOOKS}/:id`,
        element: <Product />,
      },
      {
        path: REGISTRATION,
        element: <Registration />,
      },
      {
        path: LOGIN,
        element: <Login />,
      },
      {
        path: CART,
        element: <Cart />,
      },
      {
        element: <ProtectedRoutes />,
        loader: protectedRouteLoader,
        children: [
          {
            path: ACCOUNT,
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
]
