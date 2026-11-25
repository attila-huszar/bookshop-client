import { lazy, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { Loading } from '@/components/Loading'
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute'
import { pageTitle, ROUTE } from './route'

const cmsComponents = {
  Layout: lazy(() =>
    import('@/pages/CMS/CMS').then((m) => ({ default: m.CMS })),
  ),
  Orders: lazy(() =>
    import('@/pages/CMS/components/Orders/Orders').then((m) => ({
      default: m.Orders,
    })),
  ),
  Books: lazy(() =>
    import('@/pages/CMS/components/Books/Books').then((m) => ({
      default: m.Books,
    })),
  ),
  Authors: lazy(() =>
    import('@/pages/CMS/components/Authors/Authors').then((m) => ({
      default: m.Authors,
    })),
  ),
  Users: lazy(() =>
    import('@/pages/CMS/components/Users/Users').then((m) => ({
      default: m.Users,
    })),
  ),
}

export const cmsRoute: RouteObject = {
  element: (
    <main tabIndex={-1}>
      <ProtectedRoute adminRequired />
    </main>
  ),
  children: [
    {
      path: `${ROUTE.CMS}/*`,
      handle: pageTitle('navigation.cms'),
      element: (
        <Suspense fallback={<Loading fullScreen />}>
          <cmsComponents.Layout />
        </Suspense>
      ),
      children: [
        {
          path: ROUTE.ORDERS,
          Component: cmsComponents.Orders,
          handle: pageTitle('cms.entities.order', 2),
        },
        {
          path: ROUTE.BOOKS,
          Component: cmsComponents.Books,
          handle: pageTitle('cms.entities.book', 2),
        },
        {
          path: 'authors',
          Component: cmsComponents.Authors,
          handle: pageTitle('cms.entities.author', 2),
        },
        {
          path: 'users',
          Component: cmsComponents.Users,
          handle: pageTitle('cms.entities.user', 2),
        },
        {
          path: '*',
          element: <Navigate to={`/${ROUTE.CMS}/${ROUTE.ORDERS}`} replace />,
        },
      ],
    },
  ],
}
