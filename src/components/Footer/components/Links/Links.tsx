import { legalLinks, socialLinks } from '@/constants'
import { NavList, SocialsList, StyledLinks } from './Links.style'

export function Links() {
  return (
    <StyledLinks>
      <NavList>
        {legalLinks.map((link) => (
          <li key={link.key}>
            <a href={link.path}>{link.name}</a>
          </li>
        ))}
      </NavList>
      <SocialsList>
        {socialLinks.map((link) => (
          <a href={link.path} key={link.key}>
            <img src={link.icon} alt={link.name} height={24} />
          </a>
        ))}
      </SocialsList>
    </StyledLinks>
  )
}
