import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.style'
import { Avatar, IconButton } from '@/components'
import { useAppDispatch, useAppSelector, useClickOutside } from '@/hooks'
import { userSelector, logout } from '@/store'
import { ROUTE } from '@/routes'
import { AccountIcon, profileIcon, logoutIcon } from '@/assets/svg'

export function AccountMenu() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { userData } = useAppSelector(userSelector)

  useClickOutside({ ref: menuRef, state: menuOpen, setter: setMenuOpen })

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLogout = () => {
    toggleMenu()

    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success(`${userData?.email} successfully logged out`, {
          id: 'logout-success',
        })
      })
      .catch((error: Error) => {
        toast.error(error.message, {
          id: 'logout-error',
        })
      })
  }

  const navigateToLogin = async () => {
    await navigate(ROUTE.LOGIN)
  }

  return (
    <StyledMenu ref={menuRef}>
      {userData ? (
        <>
          <Avatar
            imgUrl={userData.avatar}
            onClick={toggleMenu}
            title={userData.firstName}
          />
          <Dropdown $show={menuOpen}>
            <DropdownList>
              <li>
                <Link to={`/${ROUTE.ACCOUNT}`} onClick={toggleMenu}>
                  <MenuItem>
                    <img src={profileIcon} alt="profile" />
                    <span>{userData.firstName}</span>
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
        </>
      ) : (
        <IconButton
          onClick={() => void navigateToLogin()}
          icon={<AccountIcon />}
          title={'Login/Register'}
        />
      )}
    </StyledMenu>
  )
}
