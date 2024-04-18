import {
  Layout,
  Home,
  Products,
  Product,
  Registration,
  NotFound,
} from '../pages'
import { BOOKS, REGISTRATION } from './pathConstants'

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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
