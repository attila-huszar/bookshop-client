import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { ExtraSpace, Footer, Header, Loading } from '@/components'
import { StyledLayout } from './Layout.style'

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
