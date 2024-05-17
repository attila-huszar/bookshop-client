import { BOOKS, ACCOUNT } from '../routes/pathConstants'
import HomeIcon from '../assets/svg/home.svg'
import BookIcon from '../assets/svg/book.svg'
import LogoutIcon from '../assets/svg/logout.svg'
import AccountIcon from '../assets/svg/user_account.svg'
import instagramIcon from '../assets/svg/instagram.svg'
import googleIcon from '../assets/svg/google.svg'
import fbIcon from '../assets/svg/facebook.svg'

export const menuLinks = [
  { path: '/', name: 'Home', icon: HomeIcon },
  { path: `/${BOOKS}`, name: 'Shop', icon: BookIcon },
]

export const logoutLink = { path: '/', name: 'Logout', icon: LogoutIcon }

export const accountLink = { path: `/${ACCOUNT}`, icon: AccountIcon }

export const navLinks: { [key: string]: [string, string] }[] = [
  { about: ['', 'About'] },
  { features: ['', 'Features'] },
  { pricing: ['', 'Pricing'] },
  { gallery: ['', 'Gallery'] },
  { team: ['', 'Team'] },
]

export const socialLinks: { [key: string]: [string, string] }[] = [
  { instagram: ['', instagramIcon] },
  { google: ['', googleIcon] },
  { facebook: ['', fbIcon] },
]

export const legalLinks: { [key: string]: [string, string] }[] = [
  { privacyPolicy: ['', 'Privacy Policy'] },
  { termsOfUse: ['', 'Terms of Use'] },
  { salesAndRefunds: ['', 'Sales and Refunds'] },
  { legal: ['', 'Legal'] },
]
