import { FC, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/Button'
import { XIcon } from '@/assets/svg'
import {
  Backdrop,
  DrawerCloseButton,
  StyledDrawerPanel,
} from './MenuDrawer.styles'

type Props = {
  show: boolean
  drawerRef: RefObject<HTMLDivElement | null>
  children: ReactNode
  onClose: () => void
}

export const MenuDrawer: FC<Props> = ({
  show,
  drawerRef,
  children,
  onClose,
}) => {
  const { t } = useTranslation()

  return createPortal(
    <>
      <Backdrop $show={show} onClick={onClose} />
      <StyledDrawerPanel $show={show} ref={drawerRef}>
        <DrawerCloseButton>
          <IconButton
            onClick={onClose}
            icon={<XIcon />}
            title={t('navigation.closeMenu')}
            $size="md"
          />
        </DrawerCloseButton>
        {children}
      </StyledDrawerPanel>
    </>,
    document.body,
  )
}
