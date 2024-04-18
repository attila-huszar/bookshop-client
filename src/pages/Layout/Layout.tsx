import { Outlet, ScrollRestoration } from 'react-router-dom'
import { StyledLayout } from './Layout.styles'
import { Header, Footer } from '../../components'
import { Toaster } from 'react-hot-toast'

export function Layout() {
  return (
    <>
      <ScrollRestoration />
      <StyledLayout>
        <Toaster
          toastOptions={{
            duration: 3000,
          }}
        />
        <Header />
        <Outlet />
        <Footer />
      </StyledLayout>
    </>
  )
}
