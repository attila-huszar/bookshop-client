import { Outlet } from 'react-router-dom'
import { StyledLayout } from './Layout.styles'
import { Header, Footer } from '../../components'

export function Layout() {
  return (
    <StyledLayout>
      <Header />
      <Outlet />
      <Footer />
    </StyledLayout>
  )
}
