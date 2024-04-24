import {
  Layout,
  Home,
  Products,
  Product,
  Registration,
  Login,
  Cart,
  NotFound,
} from '../pages'
import { BOOKS, REGISTRATION, LOGIN, CART } from './pathConstants'

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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
