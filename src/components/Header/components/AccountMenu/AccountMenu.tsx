import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { userSelector } from '@/store/selectors'
import { logout } from '@/store/thunks/user'
import { toast } from '@/components/AppToaster'
import { Avatar } from '@/components/Avatar'
import { Button, IconButton } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useClickOutside } from '@/hooks/useClickOutside'
import { UserRole } from '@/types'
import {
  CMSIcon,
  LogoutIcon,
  OrdersIcon,
  ProfileIcon,
  UserOutlineIcon,
} from '@/assets/svg'
import { MenuItem, MenuList, StyledMenu } from '../Menu/Menu.style'
import { MenuDrawer } from '../MenuDrawer/MenuDrawer'
import { MenuDropdown } from '../MenuDropdown/MenuDropdown'

export function AccountMenu() {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isMobile } = useBreakpoints()
  const [menuOpen, setMenuOpen] = useState(false)
  const { accessToken, userData } = useAppSelector(userSelector)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    isMobile ? [menuRef, drawerRef] : [menuRef, dropdownRef],
    () => setMenuOpen(false),
  )

  const isAuthenticated = !!(accessToken && userData)
  const isAdmin = userData?.role === UserRole.Admin

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLoginClick = () => {
    void navigate(`/${ROUTE.LOGIN}`)
  }

  const handleLogout = () => {
    toggleMenu()

    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success(t('auth.loggedOut', { email: userData?.email ?? '' }), {
          id: 'logout-success',
        })
      })
      .catch((error: Error) => {
        toast.error(error.message, {
          id: 'logout-error',
        })
      })
  }

  if (!isAuthenticated || !userData) {
    const loginButton = isMobile ? (
      <IconButton
        onClick={handleLoginClick}
        icon={<UserOutlineIcon />}
        title={t('auth.loginRegister')}
      />
    ) : (
      <Button
        onClick={handleLoginClick}
        title={t('auth.loginRegister')}
        $icon={<UserOutlineIcon />}
        $size="smMd"
        $inverted>
        {t('auth.login')}
      </Button>
    )

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {loginButton}
        <LanguageSwitcher />
      </div>
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
      <li>
        <Link to={`/${ROUTE.ORDERS}`} onClick={toggleMenu}>
          <MenuItem>
            <OrdersIcon height="1.5rem" />
            <span>{t('navigation.orders')}</span>
          </MenuItem>
        </Link>
      </li>
      {isAdmin && (
        <li>
          <Link to={`/${ROUTE.CMS}/orders`} onClick={toggleMenu}>
            <MenuItem>
              <CMSIcon height="1.5rem" />
              <span>{t('navigation.cms')}</span>
            </MenuItem>
          </Link>
        </li>
      )}
      <li>
        <LanguageSwitcher />
      </li>
      <li>
        <Link to={'/'} onClick={handleLogout}>
          <MenuItem>
            <LogoutIcon height="1.5rem" />
            <span>{t('auth.logout')}</span>
          </MenuItem>
        </Link>
      </li>
    </MenuList>
  )

  return (
    <StyledMenu ref={menuRef}>
      <Avatar
        imgUrl={userData.avatar ?? undefined}
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
