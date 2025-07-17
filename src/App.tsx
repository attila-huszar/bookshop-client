import { Toaster } from 'react-hot-toast'
import { Routes } from '@/routes'
import { GlobalStyle } from '@/styles'

function App() {
  return (
    <>
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
      <Routes />
      <GlobalStyle />
    </>
  )
}

export default App
