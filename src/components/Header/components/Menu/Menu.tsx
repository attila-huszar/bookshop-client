import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconButton } from '@/components'
import { useClickOutside } from '@/hooks'
import { menuLinks } from '@/constants'
import { MenuIcon } from '@/assets/svg'
import { Dropdown, DropdownList, MenuItem, StyledMenu } from './Menu.style'

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setMenuOpen(false))

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
                  <link.Icon />
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
