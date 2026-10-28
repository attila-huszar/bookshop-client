import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { booksApi } from '@/store/api/booksApi'
import { booksQueryArgs } from '@/store/selectors'
import { IconButton } from '@/components/Button'
import { useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useClickOutside } from '@/hooks/useClickOutside'
import { CacheTime } from '@/constants/cacheTimes'
import { menuLinks } from '@/constants/links'
import { MenuIcon } from '@/assets/svg'
import { MenuDrawer } from '../MenuDrawer/MenuDrawer'
import { MenuDropdown } from '../MenuDropdown/MenuDropdown'
import { MenuItem, MenuList, StyledMenu } from './Menu.style'

export function Menu() {
  const { t } = useTranslation()
  const queryArgs = useAppSelector(booksQueryArgs)
  const prefetchBooks = booksApi.usePrefetch('books', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
  const prefetchOptions = booksApi.usePrefetch('searchOptions', {
    ifOlderThan: CacheTime.OneHour,
  })

  const prefetchShop = () => {
    prefetchBooks(queryArgs)
    prefetchOptions(undefined)
  }

  const { isMobile } = useBreakpoints()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    isMobile ? [menuRef, drawerRef] : [menuRef, dropdownRef],
    () => setMenuOpen(false),
  )

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const menuList = (
    <MenuList>
      {menuLinks.map((link) => (
        <li key={link.key}>
          <Link
            to={link.path}
            onClick={() => setMenuOpen(false)}
            onMouseEnter={link.key === 'shop' ? prefetchShop : undefined}
            onFocus={link.key === 'shop' ? prefetchShop : undefined}>
            <MenuItem>
              <link.Icon />
              <span>{t(link.name)}</span>
            </MenuItem>
          </Link>
        </li>
      ))}
    </MenuList>
  )

  return (
    <StyledMenu ref={menuRef}>
      <IconButton
        onClick={toggleMenu}
        icon={<MenuIcon />}
        title={t('navigation.menu')}
      />
      {isMobile ? (
        <MenuDrawer show={menuOpen} onClose={toggleMenu} drawerRef={drawerRef}>
          {menuList}
        </MenuDrawer>
      ) : (
        <MenuDropdown show={menuOpen} dropdownRef={dropdownRef}>
          {menuList}
        </MenuDropdown>
      )}
    </StyledMenu>
  )
}
