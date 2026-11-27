import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { userSelector } from '@/store/selectors'
import { logout } from '@/store/thunks/auth'
import { toast } from '@/components/AppToaster'
import { Avatar } from '@/components/Avatar'
import { Button, IconButton } from '@/components/Button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getErrorMessage } from '@/helpers/errors'
import { UserRole } from '@/types'
import {
  CMSIcon,
  LogoutIcon,
  OrdersIcon,
  ProfileIcon,
  UserOutlineIcon,
} from '@/assets/svg'
import { MenuItem } from '../Menu/Menu.style'
import { MenuDrawer } from '../MenuDrawer/MenuDrawer'
import { MenuDropdown } from '../MenuDropdown/MenuDropdown'
import {
  AccountMenuList,
  GuestActions,
  StyledAccountMenu,
} from './AccountMenu.style'

export function AccountMenu() {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isMobile } = useBreakpoints()
  const isCompactLogin = useMediaQuery('(width < 768px)')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { accessToken, userData } = useAppSelector(userSelector)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => setMenuOpen(false)

  useClickOutside(menuRef, () => {
    if (!isMobile) {
      closeMenu()
    }
  })

  const isAuthenticated = !!(accessToken && userData)
  const isAdmin = userData?.role === UserRole.Admin

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleLoginClick = () => {
    void navigate(`/${ROUTE.LOGIN}`)
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await dispatch(logout()).unwrap()
      setMenuOpen(false)
      toast.success(
        i18n.t('auth.loggedOut', { email: userData?.email ?? '' }),
        { id: 'logout-success' },
      )
      void navigate(ROUTE.HOME, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, i18n.t('auth.logoutError')), {
        id: 'logout-error',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isAuthenticated || !userData) {
    const loginLabel = t('auth.loginRegister')
    const loginButton = isCompactLogin ? (
      <IconButton
        onClick={handleLoginClick}
        icon={<UserOutlineIcon aria-hidden="true" />}
        aria-label={loginLabel}
        title={loginLabel}
      />
    ) : (
      <Button
        onClick={handleLoginClick}
        title={loginLabel}
        $icon={<UserOutlineIcon />}
        $size="smMd"
        $inverted>
        {t('auth.login')}
      </Button>
    )

    return (
      <GuestActions>
        {loginButton}
        <LanguageSwitcher variant="icon" />
      </GuestActions>
    )
  }

  const menuList = (
    <AccountMenuList>
      <li>
        <Link to={`/${ROUTE.ACCOUNT}`} onClick={closeMenu}>
          <MenuItem>
            <ProfileIcon height="1.5rem" />
            <span>{userData.firstName}</span>
          </MenuItem>
        </Link>
      </li>
      <li>
        <Link to={`/${ROUTE.ORDERS}`} onClick={closeMenu}>
          <MenuItem>
            <OrdersIcon height="1.5rem" />
            <span>{t('navigation.orders')}</span>
          </MenuItem>
        </Link>
      </li>
      {isAdmin && (
        <li>
          <Link to={`/${ROUTE.CMS}/${ROUTE.ORDERS}`} onClick={closeMenu}>
            <MenuItem>
              <CMSIcon height="1.5rem" />
              <span>{t('navigation.cms')}</span>
            </MenuItem>
          </Link>
        </li>
      )}
      <li>
        <LanguageSwitcher variant="menu" />
      </li>
      <li>
        <MenuItem
          as="button"
          type="button"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}>
          <LogoutIcon height="1.5rem" />
          <span>{t('auth.logout')}</span>
        </MenuItem>
      </li>
    </AccountMenuList>
  )

  return (
    <StyledAccountMenu ref={menuRef}>
      <Avatar
        aria-controls={menuId}
        aria-expanded={menuOpen}
        aria-haspopup={isMobile ? 'dialog' : undefined}
        imgUrl={userData.avatar ?? undefined}
        onClick={toggleMenu}
        title={userData.firstName}
      />
      {isMobile ? (
        <MenuDrawer
          id={menuId}
          label={userData.firstName}
          show={menuOpen}
          onClose={closeMenu}>
          {menuList}
        </MenuDrawer>
      ) : (
        <MenuDropdown id={menuId} show={menuOpen}>
          {menuList}
        </MenuDropdown>
      )}
    </StyledAccountMenu>
  )
}
