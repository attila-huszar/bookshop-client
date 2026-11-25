import { type ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/Button'
import { useClickOutside } from '@/hooks/useClickOutside'
import { XIcon } from '@/assets/svg'
import { DrawerCloseButton, StyledDrawerPanel } from './MenuDrawer.styles'

type Props = {
  id: string
  label?: string
  show: boolean
  children: ReactNode
  onClose: () => void
}

export function MenuDrawer({ id, label, show, children, onClose }: Props) {
  const { t } = useTranslation()
  const drawerRef = useRef<HTMLDialogElement>(null)

  useClickOutside(drawerRef, onClose)

  useEffect(() => {
    const drawer = drawerRef.current

    if (show && !drawer?.open) {
      drawer?.showModal()
    } else if (!show && drawer?.open) {
      drawer.close()
    }
  }, [show])

  return (
    <StyledDrawerPanel
      id={id}
      ref={drawerRef}
      aria-label={label ?? t('navigation.menu')}
      onClose={(event) => {
        if (!event.currentTarget.open) {
          onClose()
        }
      }}>
      <DrawerCloseButton>
        <IconButton
          type="button"
          onClick={onClose}
          icon={<XIcon aria-hidden="true" />}
          title={t('navigation.closeMenu')}
          $size="md"
        />
      </DrawerCloseButton>
      {children}
    </StyledDrawerPanel>
  )
}
