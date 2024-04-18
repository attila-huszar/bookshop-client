import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { StyledMenu, Dropdown, DropdownList, MenuItem } from './Menu.styles'
import { IconButton } from '../../../../components'
import { menuLinks } from '../../../../lib/menuLinks'
import MenuIcon from '../../../../assets/svg/menu.svg?react'

export function Menu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuOpen && !menuRef.current?.contains(event.target as Element)) {
        setMenuOpen(false)
      }
    },
    [menuOpen],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

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
