import { NavList } from '../../Footer.styles'
import { SocialLinks } from './Links.styles'
import instagramIcon from '../../../../assets/svg/instagram.svg'
import googleIcon from '../../../../assets/svg/google.svg'
import fbIcon from '../../../../assets/svg/facebook.svg'

const navLinks: { [key: string]: [string, string] }[] = [
  { privacyPolicy: ['', 'Privacy Policy'] },
  { termsOfUse: ['', 'Terms of Use'] },
  { salesAndRefunds: ['', 'Sales and Refunds'] },
  { legal: ['', 'Legal'] },
]

const socialLinks: { [key: string]: [string, string] }[] = [
  { instagram: ['', instagramIcon] },
  { google: ['', googleIcon] },
  { facebook: ['', fbIcon] },
]

export function Links() {
  return (
    <>
      <NavList>
        {navLinks.map((el) => (
          <li key={Object.keys(el)[0]}>
            <a href={Object.values(el)[0][0]}>{Object.values(el)[0][1]}</a>
          </li>
        ))}
      </NavList>
      <SocialLinks>
        {socialLinks.map((el) => (
          <a href={Object.values(el)[0][0]} key={Object.keys(el)[0]}>
            <img src={Object.values(el)[0][1]} alt={Object.keys(el)[0]} />
          </a>
        ))}
      </SocialLinks>
    </>
  )
}
