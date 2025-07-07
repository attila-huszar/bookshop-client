import { Outlet } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { StyledLayout } from './Layout.style'
import { Header, Footer, ExtraSpace } from '@/components'

export function Layout() {
  return (
    <StyledLayout>
      <ExtraSpace />
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
