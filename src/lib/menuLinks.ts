import { BOOKS } from '../routes/pathConstants'
import HomeIcon from '../assets/svg/home.svg'
import BookIcon from '../assets/svg/book.svg'
import AccountIcon from '../assets/svg/account.svg'

export const menuLinks = [
  { path: '/', name: 'Home', icon: HomeIcon },
  { path: `/${BOOKS}`, name: 'Shop', icon: BookIcon },
  { path: '#', name: 'Account', icon: AccountIcon },
]
