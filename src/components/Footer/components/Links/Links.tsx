import { NavList } from '../../Footer.style'
import { SocialLinks } from './Links.style'
import { legalLinks, socialLinks } from '@/constants'

export function Links() {
  return (
    <>
      <NavList>
        {legalLinks.map((link) => (
          <li key={link.key}>
            <a href={link.path}>{link.name}</a>
          </li>
        ))}
      </NavList>
      <SocialLinks>
        {socialLinks.map((link) => (
          <a href={link.path} key={link.key}>
            <img src={link.icon} alt={link.name} height={24} />
          </a>
        ))}
      </SocialLinks>
    </>
  )
}
