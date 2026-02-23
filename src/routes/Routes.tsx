import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
  RouterProvider,
} from 'react-router'
import { Home } from '@/pages/Home/Home'
import { Layout } from '@/pages/Layout/Layout'
import { Alert, Loading } from '@/components'
import {
  authLoader,
  cartLoader,
  checkoutLoader,
  cmsLoader,
  landingPageLoader,
  productLoader,
  shopLoader,
} from './loaders'
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute'
import { PublicRoute } from './PublicRoute/PublicRoute'
import { ROUTE } from './route'

const Products = lazy(() =>
  import('@/pages/Products/Products').then((m) => ({ default: m.Products })),
)
const Product = lazy(() =>
  import('@/pages/Product/Product').then((m) => ({ default: m.Product })),
)
const Registration = lazy(() =>
  import('@/pages/Registration/Registration').then((m) => ({
    default: m.Registration,
  })),
)
const Login = lazy(() =>
  import('@/pages/Login/Login').then((m) => ({ default: m.Login })),
)
const Cart = lazy(() =>
  import('@/pages/Cart/Cart').then((m) => ({ default: m.Cart })),
)
const Account = lazy(() =>
  import('@/pages/Account/Account').then((m) => ({ default: m.Account })),
)
const VerifyEmail = lazy(() =>
  import('@/pages/VerifyEmail/VerifyEmail').then((m) => ({
    default: m.VerifyEmail,
  })),
)
const PasswordReset = lazy(() =>
  import('@/pages/PasswordReset/PasswordReset').then((m) => ({
    default: m.PasswordReset,
  })),
)
const Checkout = lazy(() =>
  import('@/pages/Checkout/Checkout').then((m) => ({ default: m.Checkout })),
)

const CMS = lazy(() =>
  import('@/pages/CMS/CMS').then((m) => ({ default: m.CMS })),
)
const Orders = lazy(() =>
  import('@/pages/CMS/components/Orders/Orders').then((m) => ({
    default: m.Orders,
  })),
)
const Books = lazy(() =>
  import('@/pages/CMS/components/Books/Books').then((m) => ({
    default: m.Books,
  })),
)
const Authors = lazy(() =>
  import('@/pages/CMS/components/Authors/Authors').then((m) => ({
    default: m.Authors,
  })),
)
const Users = lazy(() =>
  import('@/pages/CMS/components/Users/Users').then((m) => ({
    default: m.Users,
  })),
)

const NotFound = lazy(() =>
  import('@/pages/NotFound/NotFound').then((m) => ({ default: m.NotFound })),
)

const routes: RouteObject[] = [
  {
    path: ROUTE.HOME,
    element: (
      <ErrorBoundary fallback={<Alert fullScreen />}>
        <Layout />
      </ErrorBoundary>
    ),
    loader: authLoader,
    errorElement: <Alert fullScreen />,
    hydrateFallbackElement: <></>,
    children: [
      {
        index: true,
        element: <Home />,
        loader: landingPageLoader,
      },
      {
        path: ROUTE.BOOKS,
        element: <Products />,
        loader: shopLoader,
      },
      {
        path: ROUTE.BOOK,
        element: <Product />,
        loader: ({ request }) => productLoader(request),
      },
      {
        path: ROUTE.CART,
        element: <Cart />,
        loader: cartLoader,
      },
      { path: ROUTE.VERIFICATION, element: <VerifyEmail /> },
      { path: ROUTE.PASSWORD_RESET, element: <PasswordReset /> },
      {
        element: <PublicRoute />,
        children: [
          {
            path: ROUTE.REGISTER,
            element: <Registration />,
          },
          {
            path: ROUTE.LOGIN,
            element: <Login />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        loader: () => authLoader({ loginRequired: true }),
        children: [
          {
            path: ROUTE.ACCOUNT,
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
    path: ROUTE.CHECKOUT,
    element: (
      <Suspense fallback={<Loading fullScreen />}>
        <Checkout />
      </Suspense>
    ),
    loader: checkoutLoader,
  },
  {
    element: <ProtectedRoute />,
    loader: () => authLoader({ adminRequired: true }),
    children: [
      {
        path: `${ROUTE.CMS}/*`,
        element: (
          <Suspense fallback={<Loading fullScreen />}>
            <CMS />
          </Suspense>
        ),
        children: [
          {
            path: 'orders',
            element: <Orders />,
            loader: () => cmsLoader('orders'),
          },
          {
            path: 'books',
            element: <Books />,
            loader: () => cmsLoader('books'),
          },
          {
            path: 'authors',
            element: <Authors />,
            loader: () => cmsLoader('authors'),
          },
          {
            path: 'users',
            element: <Users />,
            loader: () => cmsLoader('users'),
          },
          {
            path: '*',
            element: <Navigate to={'/cms/orders'} replace />,
          },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export const Routes: React.FC = () => {
  return <RouterProvider router={router} />
}
