import {
  homeIcon,
  bookIcon,
  facebookIcon,
  googleIcon,
  instagramIcon,
} from '@/assets/svg'

export const menuLinks = [
  { path: '/', name: 'Home', key: 'home', icon: homeIcon },
  { path: '/books', name: 'Shop', key: 'shop', icon: bookIcon },
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
  { path: '#', name: 'Facebook', key: 'facebook', icon: facebookIcon },
]

export const legalLinks = [
  { path: '#', name: 'Privacy Policy', key: 'privacyPolicy' },
  { path: '#', name: 'Terms of Use', key: 'termsOfUse' },
  { path: '#', name: 'Sales and Refunds', key: 'salesAndRefunds' },
  { path: '#', name: 'Legal', key: 'legal' },
]
