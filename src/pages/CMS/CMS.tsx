import { useNavigate } from 'react-router'
import { Button, ExtraSpace } from '@/components'
import { Tabs } from './components'
import { StyledCMS, BackToMain, MainContainer } from './CMS.style'
import { useAppSelector } from '@/hooks'
import { LogoutIcon } from '@/assets/svg'

export const CMS = () => {
  const navigate = useNavigate()
  const { userData } = useAppSelector((state) => state.user)

  async function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      await navigate(-1)
    } else {
      await navigate('/')
    }
  }

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <Tabs />
        <BackToMain>
          <Button
            $icon={<LogoutIcon />}
            $iconPos="right"
            $size="sm"
            type="button"
            onClick={() => void handleGoBack()}
            color="#fdfdfd">
            {userData?.firstName}
          </Button>
        </BackToMain>
      </MainContainer>
    </StyledCMS>
  )
}
