import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Footer } from '@/components/Footer'
import { ExtraSpace, Header } from '@/components/Header'
import { Loading } from '@/components/Loading'
import { PageShadow, StyledLayout } from './Layout.style'

export function Layout() {
  return (
    <StyledLayout>
      <PageShadow aria-hidden="true" />
      <ExtraSpace />
      <Header />
      <Suspense fallback={<Loading fullScreen />}>
        <Outlet />
      </Suspense>
      <Footer />
    </StyledLayout>
  )
}
