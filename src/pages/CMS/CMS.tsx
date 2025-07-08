import { useNavigate } from 'react-router'
import { Button, ExtraSpace } from '@/components'
import { Tabs } from './components'
import { StyledCMS, BackToMain, MainContainer } from './CMS.style'
import { useAppSelector } from '@/hooks'
import { LogoutIcon } from '@/assets/svg'

export const CMS = () => {
  const navigate = useNavigate()
  const { userData } = useAppSelector((state) => state.user)

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <Tabs />
        <BackToMain>
          <Button
            onClick={() => void navigate('/')}
            $icon={<LogoutIcon />}
            $iconPos="right"
            $size="sm"
            type="button">
            {userData?.firstName}
          </Button>
        </BackToMain>
      </MainContainer>
    </StyledCMS>
  )
}
