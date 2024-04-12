import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StyledMenu, Dropdown, DropdownList } from './Menu.styles'
import { Button } from '../../../../components'
import { menuLinks } from '../../../../lib/menuLinks'
import menuIcon from '../../../../assets/svg/menu.svg'

export function Menu() {
  const [openMenu, setOpenMenu] = useState(false)
  const toggleMenu = () => {
    setOpenMenu((prevState) => !prevState)
  }

  return (
    <StyledMenu>
      <Button onClick={toggleMenu} icon={menuIcon} />
      <Dropdown $show={openMenu}>
        <DropdownList>
          {menuLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.path} onClick={toggleMenu}>
                {link.name}
              </Link>
            </li>
          ))}
        </DropdownList>
      </Dropdown>
    </StyledMenu>
  )
}
