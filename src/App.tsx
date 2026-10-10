import { Routes } from '@/routes'
import { useUserProfileQuery } from '@/store/api/bookshopApi'
import { AppToaster } from '@/components'
import { useAppSelector } from '@/hooks'
import { GlobalStyle } from '@/styles'

function App() {
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
