import { FC, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@/components'
import { XMarkIcon } from '@/assets/svg'
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
  return createPortal(
    <>
      <Backdrop $show={show} onClick={onClose} />
      <StyledDrawerPanel $show={show} ref={drawerRef}>
        <DrawerCloseButton>
          <IconButton
            onClick={onClose}
            icon={<XMarkIcon />}
            title="Close menu"
            $size="md"
          />
        </DrawerCloseButton>
        {children}
      </StyledDrawerPanel>
    </>,
    document.body,
  )
}
