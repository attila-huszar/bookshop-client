import {
  Layout,
  Home,
  Products,
  Product,
  LoginAndRegister,
  NotFound,
} from '../pages'
import { BOOKS, REGISTRATION, LOGIN } from './pathConstants'

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
        element: <LoginAndRegister />,
      },
      {
        path: LOGIN,
        element: <LoginAndRegister />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
