import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { StyledMenu, Dropdown, DropdownList, MenuItem } from './Menu.styles'
import { IconButton } from 'components'
import { useClickOutside } from 'hooks'
import { PATH } from 'lib'
import MenuIcon from 'assets/svg/menu.svg?react'
import homeIcon from 'assets/svg/home.svg'
import bookIcon from 'assets/svg/book.svg'

const menuLinks = [
  { path: '/', name: 'Home', key: 'home', icon: homeIcon },
  { path: `/${PATH.books}`, name: 'Shop', key: 'shop', icon: bookIcon },
]

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, menuOpen, setMenuOpen)

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
