import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useClickOutside([menuRef, drawerRef], () => setOpen(false))

  const closeMenu = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const actions = (
    <ActionList id={menuId} aria-label={t('navigation.cms')}>
      <li>
        <MenuItem
          as="button"
          type="button"
          autoFocus
          onClick={() => {
            closeMenu()
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
        <Link to="/" onClick={() => setOpen(false)}>
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
        if (open && event.key === 'Escape') {
          event.preventDefault()
          closeMenu()
        }
      }}>
      <IconButton
        ref={buttonRef}
        type="button"
        title={t('navigation.menu')}
        aria-label={t('navigation.menu')}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        icon={<MenuIcon aria-hidden="true" />}
        onClick={() => setOpen((previous) => !previous)}
      />
      {open &&
        (isMobile ? (
          <MenuDrawer show onClose={closeMenu} drawerRef={drawerRef}>
            {actions}
          </MenuDrawer>
        ) : (
          <MenuDropdown show dropdownRef={dropdownRef}>
            {actions}
          </MenuDropdown>
        ))}
    </StyledCMSMenu>
  )
}
