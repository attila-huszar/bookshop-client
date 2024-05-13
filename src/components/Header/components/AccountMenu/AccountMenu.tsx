import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconButton, Avatar } from '../../../../components'
import {
  useAppDispatch,
  useAppSelector,
  useLocalStorage,
  useClickOutside,
} from '../../../../hooks'
import { userSelector, logoutUser } from '../../../../store'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.styles'
import { logoutLink, userAccountLink } from '../../../../lib/menuLinks'
import { LOGIN } from '../../../../routes/pathConstants'
import AccountIcon from '../../../../assets/svg/account.svg?react'
import toast from 'react-hot-toast'

export function AccountMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { userData } = useAppSelector(userSelector)
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
    toast.success(`${userData?.email} successfully logged out`)
    dispatch(logoutUser())
  }

  return (
    <StyledMenu ref={menuRef}>
      {userData ? (
        <Avatar
          imgUrl={userData.avatar as string}
          onClick={toggleMenu}
          title={userData.firstName}
        />
      ) : (
        <IconButton
          onClick={() => navigate(LOGIN)}
          icon={<AccountIcon />}
          title={'Login/Register'}
        />
      )}
      {userData && (
        <Dropdown $show={menuOpen}>
          <DropdownList>
            <li>
              <Link to={userAccountLink.path} onClick={toggleMenu}>
                <MenuItem>
                  <img src={userAccountLink.icon} width={24} height={22} />
                  <span>{userData.firstName}</span>
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
