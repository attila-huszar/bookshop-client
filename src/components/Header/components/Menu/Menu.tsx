import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { StyledMenu, Dropdown, DropdownList, MenuItem } from './Menu.style'
import { IconButton } from '@/components'
import { useClickOutside } from '@/hooks'
import { menuLinks } from '@/constants'
import { MenuIcon } from '@/assets/svg'

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside({ ref: menuRef, state: menuOpen, setter: setMenuOpen })

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  return (
    <StyledMenu ref={menuRef}>
      <IconButton onClick={toggleMenu} icon={<MenuIcon />} title="Menu" />
      <Dropdown $show={menuOpen}>
        <DropdownList>
          {menuLinks.map((link) => (
            <li key={link.key}>
              <Link to={link.path} onClick={toggleMenu}>
                <MenuItem>
                  <img src={link.icon} alt={link.name} />
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
