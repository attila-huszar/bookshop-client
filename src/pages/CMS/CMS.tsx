import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, ExtraSpace } from '@/components'
import { Tabs, TabValue } from './components'
import { StyledCMS, BackToMain, MainContainer, MenuButtons } from './CMS.style'
import { useAppSelector } from '@/hooks'
import { LogoutIcon } from '@/assets/svg'

export const CMS = () => {
  const { userData } = useAppSelector((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabValue>('order')
  const navigate = useNavigate()

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <MenuButtons>
          <Button
            onClick={() => undefined}
            $size="smMd"
            $color="secondary"
            type="button">
            {`Add ${activeTab}`}
          </Button>
          <Button
            onClick={() => undefined}
            $size="smMd"
            $color="danger"
            type="button">
            Remove selected
          </Button>
        </MenuButtons>
        <BackToMain>
          <Button
            onClick={() => void navigate('/')}
            $icon={<LogoutIcon />}
            $iconPos="right"
            $size="smMd"
            $inverted
            type="button">
            {userData?.firstName}
          </Button>
        </BackToMain>
      </MainContainer>
    </StyledCMS>
  )
}
