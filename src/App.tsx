import { Routes } from '@/routes/Routes'
import { useUserProfileQuery } from '@/store/api/usersApi'
import { AppToaster } from '@/components/AppToaster'
import { useAppSelector } from '@/hooks/redux'
import { GlobalStyle } from '@/styles/global.styles'

function App() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  useUserProfileQuery(undefined, { skip: !accessToken, refetchOnFocus: true })

  return (
    <>
      <AppToaster />
      <Routes />
      <GlobalStyle />
    </>
  )
}

export default App
