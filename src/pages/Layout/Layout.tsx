import { Outlet } from 'react-router-dom'
import { StyledLayout } from './Layout.styles'
import { Header, Footer } from '../../components'
import { Toaster } from 'react-hot-toast'

export function Layout() {
  return (
    <StyledLayout>
      <Toaster
        containerStyle={{ marginTop: '2rem' }}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '1.125rem',
            textAlign: 'center',
          },
        }}
      />
      <Header />
      <Outlet />
      <Footer />
    </StyledLayout>
  )
}
