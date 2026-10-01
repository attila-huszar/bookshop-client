import { Routes } from '@/routes'
import { AppToaster } from '@/components'
import { GlobalStyle } from '@/styles'

function App() {
  return (
    <>
      <AppToaster />
      <Routes />
      <GlobalStyle />
    </>
  )
}

export default App
