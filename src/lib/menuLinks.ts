import { BOOKS, ACCOUNT } from '../routes/pathConstants'
import HomeIcon from '../assets/svg/home.svg'
import BookIcon from '../assets/svg/book.svg'
import LogoutIcon from '../assets/svg/logout.svg'
import UserAccountIcon from '../assets/svg/user_account.svg'

export const menuLinks = [
  { path: '/', name: 'Home', icon: HomeIcon },
  { path: `/${BOOKS}`, name: 'Shop', icon: BookIcon },
]

export const logoutLink = { path: '/', name: 'Logout', icon: LogoutIcon }
export const userAccountLink = { path: `/${ACCOUNT}`, icon: UserAccountIcon }
