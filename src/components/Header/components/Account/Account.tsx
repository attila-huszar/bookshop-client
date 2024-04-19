import { useState, useEffect, useCallback, useRef } from 'react'
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
import AccountLoggedInIcon from '../../../../assets/svg/account_loggedin.svg?react'
import toast from 'react-hot-toast'
import { useLocalStorage } from '../../../../hooks'
import { LOGIN } from '../../../../routes/pathConstants'

export function Account() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const { removeFromLocalStorage } = useLocalStorage()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState)
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuOpen && !menuRef.current?.contains(event.target as Element)) {
        setMenuOpen(false)
      }
    },
    [menuOpen],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <StyledMenu ref={menuRef}>
      <IconButton
        onClick={user ? toggleMenu : () => navigate(LOGIN)}
        icon={user ? <AccountLoggedInIcon /> : <AccountIcon />}
        title={user?.firstName || 'Account'}
        $iconSize="sm"
      />
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
              <Link
                to={logoutLink.path}
                onClick={() => {
                  toggleMenu()
                  removeFromLocalStorage('uuid')
                  toast.success(`${user.email} successfully logged out`)
                  dispatch(logoutUser())
                }}>
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
