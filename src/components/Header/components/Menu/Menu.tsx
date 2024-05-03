import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { StyledMenu, Dropdown, DropdownList, MenuItem } from './Menu.styles'
import { IconButton } from '../../../../components'
import { menuLinks } from '../../../../lib/menuLinks'
import { useClickOutside } from '../../../../hooks'
import MenuIcon from '../../../../assets/svg/menu.svg?react'

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuOpen, setMenuOpen, menuRef)

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  return (
    <StyledMenu ref={menuRef}>
      <IconButton onClick={toggleMenu} icon={<MenuIcon />} title="Menu" />
      <Dropdown $show={menuOpen}>
        <DropdownList>
          {menuLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.path} onClick={toggleMenu}>
                <MenuItem>
                  <img src={link.icon} alt={link.name} width="24" height="24" />
                  <span>{link.name}</span>
                </MenuItem>
              </Link>
            </li>
          ))}
        </DropdownList>
      </Dropdown>
    </StyledMenu>
  )
}
