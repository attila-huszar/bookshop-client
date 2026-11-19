import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ROUTE } from '@/routes/route'
import { IconButton } from '@/components/Button'
import { MenuItem } from '@/components/Header/components/Menu/Menu.style'
import { MenuDrawer } from '@/components/Header/components/MenuDrawer/MenuDrawer'
import { MenuDropdown } from '@/components/Header/components/MenuDropdown/MenuDropdown'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useClickOutside } from '@/hooks/useClickOutside'
import { LogoutIcon, MenuIcon, SlidersIcon } from '@/assets/svg'
import { ActionList, StyledCMSMenu } from './CMSMenu.style'

type Props = {
  onOpenTerms: () => void
}

export function CMSMenu({ onOpenTerms }: Props) {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = () => setOpen(false)

  useClickOutside(menuRef, () => {
    if (!isMobile) {
      closeMenu()
    }
  })

  const closeDropdown = () => {
    closeMenu()
    buttonRef.current?.focus()
  }

  const actions = (
    <ActionList aria-label={t('navigation.cms')}>
      <li>
        <MenuItem
          as="button"
          type="button"
          autoFocus={!isMobile}
          ref={(button) => {
            button?.toggleAttribute('autofocus', isMobile)
          }}
          onClick={(event) => {
            if (isMobile) {
              // Restore focus before opening the terms dialog.
              event.currentTarget.closest('dialog')?.close()
              closeMenu()
            } else {
              closeDropdown()
            }

            onOpenTerms()
          }}>
          <SlidersIcon aria-hidden="true" />
          <span>{t('terms.title')}</span>
        </MenuItem>
      </li>
      <li>
        <LanguageSwitcher variant="menu" />
      </li>
      <li>
        <Link to={ROUTE.HOME} onClick={closeMenu}>
          <MenuItem>
            <LogoutIcon aria-hidden="true" />
            <span>{t('navigation.home')}</span>
          </MenuItem>
        </Link>
      </li>
    </ActionList>
  )

  return (
    <StyledCMSMenu
      ref={menuRef}
      onKeyDown={(event) => {
        if (!isMobile && open && event.key === 'Escape') {
          event.preventDefault()
          closeDropdown()
        }
      }}>
      <IconButton
        ref={buttonRef}
        type="button"
        title={t('navigation.menu')}
        aria-label={t('navigation.menu')}
        aria-expanded={open}
        aria-controls={isMobile || open ? menuId : undefined}
        aria-haspopup={isMobile ? 'dialog' : undefined}
        icon={<MenuIcon aria-hidden="true" />}
        onClick={() => setOpen((previous) => !previous)}
      />
      {isMobile ? (
        <MenuDrawer
          id={menuId}
          label={t('navigation.cms')}
          show={open}
          onClose={closeMenu}>
          {actions}
        </MenuDrawer>
      ) : (
        open && (
          <MenuDropdown id={menuId} show>
            {actions}
          </MenuDropdown>
        )
      )}
    </StyledCMSMenu>
  )
}
