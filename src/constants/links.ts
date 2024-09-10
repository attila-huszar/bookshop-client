import { PATH } from '@/constants'
import homeIcon from '@/assets/svg/home.svg'
import bookIcon from '@/assets/svg/book.svg'
import instagramIcon from '@/assets/svg/instagram.svg'
import googleIcon from '@/assets/svg/google.svg'
import fbIcon from '@/assets/svg/facebook.svg'

export const menuLinks = [
  { path: '/', name: 'Home', key: 'home', icon: homeIcon },
  { path: `/${PATH.books}`, name: 'Shop', key: 'shop', icon: bookIcon },
]

export const navLinks = [
  { path: '#', name: 'About', key: 'about' },
  { path: '#', name: 'Features', key: 'features' },
  { path: '#', name: 'Pricing', key: 'pricing' },
  { path: '#', name: 'Gallery', key: 'gallery' },
  { path: '#', name: 'Team', key: 'team' },
]

export const socialLinks = [
  { path: '#', name: 'Instagram', key: 'instagram', icon: instagramIcon },
  { path: '#', name: 'Google', key: 'google', icon: googleIcon },
  { path: '#', name: 'Facebook', key: 'facebook', icon: fbIcon },
]

export const legalLinks = [
  { path: '#', name: 'Privacy Policy', key: 'privacyPolicy' },
  { path: '#', name: 'Terms of Use', key: 'termsOfUse' },
  { path: '#', name: 'Sales and Refunds', key: 'salesAndRefunds' },
  { path: '#', name: 'Legal', key: 'legal' },
]
