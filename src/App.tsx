import { useTranslation } from 'react-i18next'
import { Routes } from '@/routes/Routes'
import { useUserProfileQuery } from '@/store/api/bookshopApi'
import { AppToaster } from '@/components/AppToaster'
import { useAppSelector } from '@/hooks/redux'
import { GlobalStyle } from '@/styles/global.styles'

function App() {
  useTranslation()

  const accessToken = useAppSelector((state) => state.user.accessToken)
  useUserProfileQuery({ skip: !accessToken })

  return (
    <>
      <AppToaster />
      <Routes />
      <GlobalStyle />
    </>
  )
}

export default App
