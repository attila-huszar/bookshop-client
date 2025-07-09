import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Button, ExtraSpace } from '@/components'
import { Details, Tabs } from './components'
import { StyledCMS, MainContainer, MenuButtons } from './CMS.style'
import { useAppSelector } from '@/hooks'
import { LogoutIcon } from '@/assets/svg'

export const CMS = () => {
  const { userData } = useAppSelector((state) => state.user)
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  return (
    <StyledCMS>
      <ExtraSpace />
      <MainContainer>
        <MenuButtons>
          <Button
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            $size="smMd"
            $color="secondary"
            type="button">
            Add
          </Button>
          <Button
            onClick={() => undefined}
            $size="smMd"
            $color="danger"
            type="button">
            Remove
          </Button>
          <Button
            onClick={() => void navigate('/')}
            $icon={<LogoutIcon />}
            $iconPos="right"
            $size="smMd"
            $inverted
            type="button"
            style={{ marginLeft: 'auto' }}>
            {userData?.firstName}
          </Button>
        </MenuButtons>
        {isDetailsOpen && <Details />}
        <Tabs />
        <Outlet />
      </MainContainer>
    </StyledCMS>
  )
}
