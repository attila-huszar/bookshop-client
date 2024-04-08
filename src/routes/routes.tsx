import { Layout, Home, Product, NotFound } from '../pages'

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
