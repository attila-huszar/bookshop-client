import { useTranslation } from 'react-i18next'
import { Routes } from '@/routes/Routes'
import { useUserProfileQuery } from '@/store/api/usersApi'
import { AppToaster } from '@/components/AppToaster'
import { GoogleSignInProvider } from '@/components/GoogleSignIn/GoogleSignInProvider'
import { useAppSelector } from '@/hooks/redux'
import { GlobalStyle } from '@/styles/global.styles'

function App() {
  useTranslation()

  const accessToken = useAppSelector((state) => state.auth.accessToken)
  useUserProfileQuery(undefined, { skip: !accessToken })

  return (
    <GoogleSignInProvider>
      <AppToaster />
      <Routes />
      <GlobalStyle />
    </GoogleSignInProvider>
  )
}

export default App
