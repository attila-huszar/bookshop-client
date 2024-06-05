import { PATH } from 'lib'
import homeIcon from 'assets/svg/home.svg'
import bookIcon from 'assets/svg/book.svg'
import logoutIcon from 'assets/svg/logout.svg'
import accountIcon from 'assets/svg/user_account.svg'
import instagramIcon from 'assets/svg/instagram.svg'
import googleIcon from 'assets/svg/google.svg'
import fbIcon from 'assets/svg/facebook.svg'

export const menuLinks = [
  { path: '/', name: 'Home', icon: homeIcon },
  { path: `/${PATH.books}`, name: 'Shop', icon: bookIcon },
]

export const logoutLink = { path: '/', name: 'Logout', icon: logoutIcon }

export const accountLink = { path: `/${PATH.account}`, icon: accountIcon }

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
