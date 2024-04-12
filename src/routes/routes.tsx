import { Layout, Home, Products, Product, NotFound } from '../pages'

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
        path: 'books',
        element: <Products />,
      },
      {
        path: 'books/:id',
        element: <Product />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]
