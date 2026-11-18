import { useTranslation } from 'react-i18next'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Routes } from '@/routes/Routes'
import { useUserProfileQuery } from '@/store/api/usersApi'
import { AppToaster, toast } from '@/components/AppToaster'
import { useAppSelector } from '@/hooks/redux'
import { googleClientId } from '@/constants/envConfig'
import { GlobalStyle } from '@/styles/global.styles'

function App() {
  const { t } = useTranslation()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  useUserProfileQuery(undefined, { skip: !accessToken })

  const app = (
    <>
      <AppToaster />
      <Routes />
      <GlobalStyle />
    </>
  )

  if (!googleClientId) {
    return app
  }

  return (
    <GoogleOAuthProvider
      clientId={googleClientId}
      onScriptLoadError={() => toast.error(t('auth.googleUnavailable'))}>
      {app}
    </GoogleOAuthProvider>
  )
}

export default App
