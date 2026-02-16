import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconButton } from '@/components'
import { useBreakpoints, useClickOutside } from '@/hooks'
import { menuLinks } from '@/constants'
import { MenuIcon } from '@/assets/svg'
import { MenuDrawer } from '../MenuDrawer/MenuDrawer'
import { MenuDropdown } from '../MenuDropdown/MenuDropdown'
import { MenuItem, MenuList, StyledMenu } from './Menu.style'

export function Menu() {
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

  return (
    <StyledMenu ref={menuRef}>
      <IconButton onClick={toggleMenu} icon={<MenuIcon />} title="Menu" />
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
