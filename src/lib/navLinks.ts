import instagramIcon from '../assets/svg/instagram.svg'
import googleIcon from '../assets/svg/google.svg'
import fbIcon from '../assets/svg/facebook.svg'

export const navLinks: { [key: string]: [string, string] }[] = [
  { about: ['', 'About'] },
  { features: ['', 'Features'] },
  { pricing: ['', 'Pricing'] },
  { gallery: ['', 'Gallery'] },
  { team: ['', 'Team'] },
]

export const legalLinks: { [key: string]: [string, string] }[] = [
  { privacyPolicy: ['', 'Privacy Policy'] },
  { termsOfUse: ['', 'Terms of Use'] },
  { salesAndRefunds: ['', 'Sales and Refunds'] },
  { legal: ['', 'Legal'] },
]

export const socialLinks: { [key: string]: [string, string] }[] = [
  { instagram: ['', instagramIcon] },
  { google: ['', googleIcon] },
  { facebook: ['', fbIcon] },
]
