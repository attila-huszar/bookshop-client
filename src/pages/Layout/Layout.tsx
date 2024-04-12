import { Outlet, ScrollRestoration } from 'react-router-dom'
import { StyledLayout } from './Layout.styles'
import { Header, Footer } from '../../components'

export function Layout() {
  return (
    <>
      <ScrollRestoration />
      <StyledLayout>
        <Header />
        <Outlet />
        <Footer />
      </StyledLayout>
    </>
  )
}
