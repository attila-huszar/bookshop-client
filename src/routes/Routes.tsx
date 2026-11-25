import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import {
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
} from 'react-router'
import { Home } from '@/pages/Home/Home'
import { Layout } from '@/pages/Layout/Layout'
import { Alert } from '@/components/Alert'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import { Loading } from '@/components/Loading'
import { cmsRoute } from './cmsRoutes'
import { appLoader, cartLoader, checkoutLoader } from './loaders'
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute'
import { PublicRoute } from './PublicRoute/PublicRoute'
import { pageTitle, ROUTE } from './route'
import { RouteAccessibility } from './RouteAccessibility'

const loadAuthForms = () => import('./authForms')

const Cart = lazy(() =>
  import('@/pages/Cart/Cart').then((m) => ({ default: m.Cart })),
)
const Account = lazy(() =>
  import('@/pages/Account/Account').then((m) => ({ default: m.Account })),
)
const Orders = lazy(() =>
  import('@/pages/Orders/Orders').then((m) => ({ default: m.Orders })),
)
const Checkout = lazy(() =>
  import('@/pages/Checkout/Checkout').then((m) => ({ default: m.Checkout })),
)

const routeError = (
  <main tabIndex={-1}>
    <Alert fullScreen />
  </main>
)

const routes: RouteObject[] = [
  {
    path: ROUTE.HOME,
    element: (
      <ErrorBoundary fallback={routeError}>
        <Layout />
      </ErrorBoundary>
    ),
    errorElement: routeError,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: ROUTE.BOOKS,
        lazy: () => import('@/pages/Products/Products'),
        handle: pageTitle('navigation.shop'),
      },
      {
        path: ROUTE.BOOK,
        id: ROUTE.BOOK,
        lazy: () => import('@/pages/Product/Product'),
        handle: pageTitle('catalogue.details'),
      },
      {
        path: ROUTE.CART,
        Component: Cart,
        loader: cartLoader,
        handle: pageTitle('cart.title'),
      },
      {
        path: ROUTE.VERIFICATION,
        lazy: () => import('@/pages/VerifyEmail/VerifyEmail'),
        handle: pageTitle('auth.verifyEmail'),
      },
      {
        path: ROUTE.PASSWORD_RESET,
        lazy: () => import('@/pages/PasswordReset/PasswordReset'),
        handle: pageTitle('auth.passwordReset'),
      },
      {
        path: `${ROUTE.TERMS}/:version?`,
        lazy: () => import('@/pages/Terms/Terms'),
        handle: pageTitle('terms.title'),
      },
      {
        Component: PublicRoute,
        children: [
          {
            Component: AuthorizationMenu,
            children: [
              {
                path: ROUTE.REGISTER,
                lazy: async () => (await loadAuthForms()).registerRoute,
                handle: pageTitle('auth.register'),
              },
              {
                path: ROUTE.LOGIN,
                lazy: async () => (await loadAuthForms()).loginRoute,
                handle: pageTitle('auth.login'),
              },
            ],
          },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: ROUTE.ACCOUNT,
            Component: Account,
            handle: pageTitle('account.title'),
          },
          {
            path: ROUTE.ORDERS,
            Component: Orders,
            handle: pageTitle('orders.title'),
          },
        ],
      },
      {
        path: '*',
        lazy: () => import('@/pages/NotFound/NotFound'),
        handle: pageTitle('notFound.pageTitle'),
      },
    ],
  },
  {
    path: ROUTE.CHECKOUT,
    element: (
      <main tabIndex={-1}>
        <Suspense fallback={<Loading fullScreen />}>
          <Checkout />
        </Suspense>
      </main>
    ),
    loader: checkoutLoader,
    handle: pageTitle('checkout.title'),
  },
  cmsRoute,
]

const router = createBrowserRouter([
  {
    loader: appLoader,
    Component: RouteAccessibility,
    shouldRevalidate: () => false,
    errorElement: routeError,
    hydrateFallbackElement: <Loading fullScreen />,
    children: routes,
  },
])

export const Routes: React.FC = () => {
  return <RouterProvider router={router} />
}
