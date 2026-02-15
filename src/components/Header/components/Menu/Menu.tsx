import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { IconButton } from '@/components'
import { useBreakpoints, useClickOutside } from '@/hooks'
import { menuLinks } from '@/constants'
import { MenuIcon } from '@/assets/svg'
import {
  Backdrop,
  MenuItem,
  MenuList,
  MenuPanel,
  StyledMenu,
} from './Menu.style'

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useBreakpoints()

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
          <Link to={link.path} onClick={() => setMenuOpen(false)}>
            <MenuItem>
              <link.Icon />
              <span>{link.name}</span>
            </MenuItem>
          </Link>
        </li>
      ))}
    </MenuList>
  )

  if (isMobile) {
    return (
      <StyledMenu ref={menuRef}>
        <IconButton onClick={toggleMenu} icon={<MenuIcon />} title="Menu" />
        {createPortal(
          <>
            <Backdrop $show={menuOpen} onClick={() => setMenuOpen(false)} />
            <MenuPanel $show={menuOpen} ref={drawerRef}>
              {menuList}
            </MenuPanel>
          </>,
          document.body,
        )}
      </StyledMenu>
    )
  }

  return (
    <StyledMenu ref={menuRef}>
      <IconButton onClick={toggleMenu} icon={<MenuIcon />} title="Menu" />
      <MenuPanel $show={menuOpen} ref={dropdownRef}>
        {menuList}
      </MenuPanel>
    </StyledMenu>
  )
}
