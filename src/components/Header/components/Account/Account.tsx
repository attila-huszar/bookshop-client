import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
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
import { accountLinks } from '../../../../lib/menuLinks'
import AccountIcon from '../../../../assets/svg/account.svg?react'
import AccountLoggedInIcon from '../../../../assets/svg/account_loggedin.svg?react'
import toast from 'react-hot-toast'

export function Account() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useAppSelector(userSelector)
  const dispatch = useAppDispatch()

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
        onClick={toggleMenu}
        icon={user.firstName ? <AccountLoggedInIcon /> : <AccountIcon />}
        title={user.firstName || 'Account'}
        $iconSize="sm"
      />
      <Dropdown $show={menuOpen}>
        {user.email ? (
          <DropdownList>
            <li>
              <Link to={'/account'} onClick={toggleMenu}>
                <MenuItem>
                  <AccountLoggedInIcon width={24} height={22} />
                  <span>{user.firstName}</span>
                </MenuItem>
              </Link>
            </li>
            <li>
              <Link
                to={accountLinks[1].path}
                onClick={() => {
                  toggleMenu()
                  toast.success(`${user.email} successfully logged out`)
                  dispatch(logoutUser())
                }}>
                <MenuItem>
                  <img
                    src={accountLinks[1].icon}
                    alt={accountLinks[1].name}
                    width={24}
                    height={22}
                  />
                  <span>{accountLinks[1].name}</span>
                </MenuItem>
              </Link>
            </li>
          </DropdownList>
        ) : (
          <DropdownList>
            <li>
              <Link to={accountLinks[0].path} onClick={toggleMenu}>
                <MenuItem>
                  <img
                    src={accountLinks[0].icon}
                    alt={accountLinks[0].name}
                    width={24}
                    height={22}
                  />
                  <span>{accountLinks[0].name}</span>
                </MenuItem>
              </Link>
            </li>
            <li>
              <Link to={accountLinks[2].path} onClick={toggleMenu}>
                <MenuItem>
                  <img
                    src={accountLinks[2].icon}
                    alt={accountLinks[2].name}
                    width={24}
                    height={22}
                  />
                  <span>{accountLinks[2].name}</span>
                </MenuItem>
              </Link>
            </li>
          </DropdownList>
        )}
      </Dropdown>
    </StyledMenu>
  )
}
