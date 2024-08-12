import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.styles'
import { IconButton, Avatar } from 'components'
import {
  useAppDispatch,
  useAppSelector,
  useLocalStorage,
  useClickOutside,
} from 'hooks'
import { userSelector, logoutUser } from 'store'
import { PATH } from 'constants/index'
import LoginIcon from 'assets/svg/account.svg?react'
import accountIcon from 'assets/svg/user_account.svg'
import logoutIcon from 'assets/svg/logout.svg'
import toast from 'react-hot-toast'

export function AccountMenu() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { removeFromLocalStorage } = useLocalStorage()
  const { userData } = useAppSelector(userSelector)
  const { firstName, email, avatar } = { ...userData }
  useClickOutside(menuRef, menuOpen, setMenuOpen)

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLogout = () => {
    toggleMenu()
    removeFromLocalStorage('uuid')
    toast.success(`${email} successfully logged out`)
    dispatch(logoutUser())
  }

  return (
    <StyledMenu ref={menuRef}>
      {userData ? (
        <Avatar
          imgUrl={avatar as string}
          onClick={toggleMenu}
          title={firstName}
        />
      ) : (
        <IconButton
          onClick={() => navigate(PATH.login)}
          icon={<LoginIcon />}
          title={'Login/Register'}
        />
      )}
      {userData && (
        <Dropdown $show={menuOpen}>
          <DropdownList>
            <li>
              <Link to={`/${PATH.account}`} onClick={toggleMenu}>
                <MenuItem>
                  <img src={accountIcon} alt="account" />
                  <span>{firstName}</span>
                </MenuItem>
              </Link>
            </li>
            <li>
              <Link to={'/'} onClick={handleLogout}>
                <MenuItem>
                  <img src={logoutIcon} alt="logout" />
                  <span>Logout</span>
                </MenuItem>
              </Link>
            </li>
          </DropdownList>
        </Dropdown>
      )}
    </StyledMenu>
  )
}
