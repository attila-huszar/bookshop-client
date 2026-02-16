import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { logout, userSelector } from '@/store'
import { Avatar, Button, IconButton } from '@/components'
import {
  useAppDispatch,
  useAppSelector,
  useBreakpoints,
  useClickOutside,
} from '@/hooks'
import { UserRole } from '@/types'
import { AccountIcon, CMSIcon, LogoutIcon, ProfileIcon } from '@/assets/svg'
import { MenuItem, MenuList, StyledMenu } from '../Menu/Menu.style'
import { MenuDrawer } from '../MenuDrawer/MenuDrawer'
import { MenuDropdown } from '../MenuDropdown/MenuDropdown'

export function AccountMenu() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isMobile } = useBreakpoints()
  const [menuOpen, setMenuOpen] = useState(false)
  const { userData } = useAppSelector(userSelector)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    isMobile ? [menuRef, drawerRef] : [menuRef, dropdownRef],
    () => setMenuOpen(false),
  )

  const isAdmin = userData?.role === UserRole.Admin

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLoginClick = () => {
    void navigate(ROUTE.LOGIN)
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
    return isMobile ? (
      <IconButton
        onClick={handleLoginClick}
        icon={<AccountIcon />}
        title="Login/Register"
      />
    ) : (
      <Button
        onClick={handleLoginClick}
        title="Login/Register"
        $icon={<AccountIcon />}
        $size="smMd"
        $inverted>
        Log In
      </Button>
    )
  }

  const menuList = (
    <MenuList>
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
    </MenuList>
  )

  return (
    <StyledMenu ref={menuRef}>
      <Avatar
        imgUrl={userData.avatar}
        onClick={toggleMenu}
        title={userData.firstName}
      />
      {isMobile ? (
        <MenuDrawer show={menuOpen} onClose={toggleMenu} drawerRef={drawerRef}>
          {menuList}
        </MenuDrawer>
      ) : (
        <MenuDropdown show={menuOpen} dropdownRef={dropdownRef}>
          {menuList}
        </MenuDropdown>
      )}
    </StyledMenu>
  )
}
