import {
  Layout,
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
import { ProtectedRoutes } from './ProtectedRoutes'

export const routes = [
  {
    path: '/',
    element: <Layout />,
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
        children: [{ path: ACCOUNT, element: <Account /> }],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
