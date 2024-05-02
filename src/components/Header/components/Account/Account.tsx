import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconButton } from '../../../../components'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { userSelector } from '../../../../store'
import { logoutUser } from '../../../../store/userSlice'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.styles'
import { logoutLink, userAccountLink } from '../../../../lib/menuLinks'
import AccountIcon from '../../../../assets/svg/account.svg?react'
import AccountDefaultIcon from '../../../../assets/svg/account_default.svg?react'
import toast from 'react-hot-toast'
import { useLocalStorage, useClickOutside } from '../../../../hooks'
import { LOGIN } from '../../../../routes/pathConstants'
import { Avatar } from '../../../Avatar/Avatar'

export function Account() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const { removeFromLocalStorage } = useLocalStorage()
  const navigate = useNavigate()
  useClickOutside(menuOpen, setMenuOpen, menuRef)

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLogout = () => {
    toggleMenu()
    removeFromLocalStorage('uuid')
    toast.success(`${user?.email} successfully logged out`)
    dispatch(logoutUser())
  }

  return (
    <StyledMenu ref={menuRef}>
      {user ? (
        typeof user.avatar === 'string' ? (
          <Avatar
            imgUrl={user.avatar}
            onClick={toggleMenu}
            title={user.firstName}
          />
        ) : (
          <IconButton
            onClick={toggleMenu}
            icon={<AccountDefaultIcon />}
            title={user.firstName}
            $bordered
          />
        )
      ) : (
        <IconButton
          onClick={() => navigate(LOGIN)}
          icon={<AccountIcon />}
          title={'Account'}
        />
      )}
      {user && (
        <Dropdown $show={menuOpen}>
          <DropdownList>
            <li>
              <Link to={userAccountLink.path} onClick={toggleMenu}>
                <MenuItem>
                  <img src={userAccountLink.icon} width={24} height={22} />
                  <span>{user.firstName}</span>
                </MenuItem>
              </Link>
            </li>
            <li>
              <Link to={logoutLink.path} onClick={handleLogout}>
                <MenuItem>
                  <img
                    src={logoutLink.icon}
                    alt={logoutLink.name}
                    width={24}
                    height={22}
                  />
                  <span>{logoutLink.name}</span>
                </MenuItem>
              </Link>
            </li>
          </DropdownList>
        </Dropdown>
      )}
    </StyledMenu>
  )
}
