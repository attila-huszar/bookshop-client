import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { StyledLayout } from './Layout.style'
import { Header, Footer } from '@/components'

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
