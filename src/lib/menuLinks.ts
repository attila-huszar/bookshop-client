import { BOOKS, LOGIN, REGISTRATION } from '../routes/pathConstants'
import HomeIcon from '../assets/svg/home.svg'
import BookIcon from '../assets/svg/book.svg'
import AccountIcon from '../assets/svg/account.svg'
import RegisterIcon from '../assets/svg/registration.svg'
import LogoutIcon from '../assets/svg/logout.svg'

export const menuLinks = [
  { path: '/', name: 'Home', icon: HomeIcon },
  { path: `/${BOOKS}`, name: 'Shop', icon: BookIcon },
]

export const accountLinks = [
  { path: `/${LOGIN}`, name: 'Login', icon: AccountIcon },
  { path: '/', name: 'Logout', icon: LogoutIcon },
  { path: `/${REGISTRATION}`, name: 'Register', icon: RegisterIcon },
]
