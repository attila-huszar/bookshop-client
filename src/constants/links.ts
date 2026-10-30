import {
  BookIcon,
  facebookIcon,
  googleIcon,
  HomeIcon,
  instagramIcon,
} from '@/assets/svg'

export const menuLinks = [
  { path: '/', name: 'navigation.home', key: 'home', Icon: HomeIcon },
  { path: '/books', name: 'navigation.shop', key: 'shop', Icon: BookIcon },
] as const

export const navLinks = [
  { path: '#', name: 'navigation.about', key: 'about' },
  { path: '#', name: 'navigation.features', key: 'features' },
  { path: '#', name: 'navigation.pricing', key: 'pricing' },
  { path: '#', name: 'navigation.gallery', key: 'gallery' },
  { path: '#', name: 'navigation.team', key: 'team' },
] as const

export const socialLinks = [
  { path: '#', name: 'Instagram', key: 'instagram', icon: instagramIcon },
  { path: '#', name: 'Google', key: 'google', icon: googleIcon },
  { path: '#', name: 'Facebook', key: 'facebook', icon: facebookIcon },
]

export const legalLinks = [
  { path: '#', name: 'navigation.privacy', key: 'privacyPolicy' },
  { path: '/terms', name: 'terms.title', key: 'termsOfUse' },
  { path: '#', name: 'navigation.refunds', key: 'salesAndRefunds' },
  { path: '#', name: 'navigation.legal', key: 'legal' },
] as const
