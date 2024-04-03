import { Home } from '../pages'
import { Product } from '../pages'
import { NotFound } from '../pages'

export const routes = [
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'books/:id',
        element: <Product />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]
