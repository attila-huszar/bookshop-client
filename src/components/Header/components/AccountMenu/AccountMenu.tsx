import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import {
  StyledMenu,
  Dropdown,
  DropdownList,
  MenuItem,
} from '../Menu/Menu.style'
import { Avatar, Button } from '@/components'
import { useAppDispatch, useAppSelector, useClickOutside } from '@/hooks'
import { userSelector, logout } from '@/store'
import { ROUTE } from '@/routes'
import { UserRole } from '@/types'
import { AccountIcon, ProfileIcon, LogoutIcon, CMSIcon } from '@/assets/svg'

export function AccountMenu() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { userData } = useAppSelector(userSelector)

  useClickOutside({ ref: menuRef, state: menuOpen, setter: setMenuOpen })

  const isAdmin = userData?.role === UserRole.Admin

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

  if (!userData) {
    return (
      <Button
        onClick={() => void navigate(ROUTE.LOGIN)}
        title="Login/Register"
        $icon={<AccountIcon />}
        $size="smMd"
        $inverted>
        Log In
      </Button>
    )
  }

  return (
    <StyledMenu ref={menuRef}>
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
                <ProfileIcon height="1.5rem" />
                <span>{userData.firstName}</span>
              </MenuItem>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to={`/${ROUTE.CMS}/orders`} onClick={toggleMenu}>
                <MenuItem>
                  <CMSIcon height="1.5rem" />
                  <span>CMS</span>
                </MenuItem>
              </Link>
            </li>
          )}
          <li>
            <Link to={'/'} onClick={handleLogout}>
              <MenuItem>
                <LogoutIcon height="1.5rem" />
                <span>Logout</span>
              </MenuItem>
            </Link>
          </li>
        </DropdownList>
      </Dropdown>
    </StyledMenu>
  )
}
