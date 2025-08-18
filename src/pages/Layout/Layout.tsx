import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { StyledLayout } from './Layout.style'
import { Header, Footer, ExtraSpace, Loading } from '@/components'

export function Layout() {
  return (
    <StyledLayout>
      <ExtraSpace />
      <Header />
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
      <Footer />
    </StyledLayout>
  )
}
