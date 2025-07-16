import { Outlet } from 'react-router'
import { StyledLayout } from './Layout.style'
import { Header, Footer, ExtraSpace } from '@/components'

export function Layout() {
  return (
    <StyledLayout>
      <ExtraSpace />
      <Header />
      <Outlet />
      <Footer />
    </StyledLayout>
  )
}
