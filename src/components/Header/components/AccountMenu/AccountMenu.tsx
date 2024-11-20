import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.style'
import { IconButton, Avatar } from '@/components'
import { useAppDispatch, useAppSelector, useClickOutside } from '@/hooks'
import { userSelector, logout } from '@/store'
import { PATH } from '@/constants'
import LoginIcon from '@/assets/svg/account.svg?react'
import accountIcon from '@/assets/svg/user_account.svg'
import logoutIcon from '@/assets/svg/logout.svg'

export function AccountMenu() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { userData } = useAppSelector(userSelector)
  const { firstName, email, avatar } = { ...userData }
  useClickOutside(menuRef, menuOpen, setMenuOpen)

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLogout = () => {
    toggleMenu()

    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success(`${email} successfully logged out`, {
          id: 'logout-success',
        })
      })
      .catch((error: Error) => {
        toast.error(error.message, {
          id: 'logout-error',
        })
      })
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
          onClick={() => navigate(PATH.CLIENT.login)}
          icon={<LoginIcon />}
          title={'Login/Register'}
        />
      )}
      {userData && (
        <Dropdown $show={menuOpen}>
          <DropdownList>
            <li>
              <Link to={`/${PATH.CLIENT.account}`} onClick={toggleMenu}>
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
