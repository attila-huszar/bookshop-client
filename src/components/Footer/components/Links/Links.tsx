import { useTranslation } from 'react-i18next'
import { legalLinks, socialLinks } from '@/constants/links'
import { NavList, SocialsList, StyledLinks } from './Links.style'

export function Links() {
  const { t } = useTranslation()

  return (
    <StyledLinks>
      <NavList>
        {legalLinks.map((link) => (
          <li key={link.key}>
            <a href={link.path}>{t(link.name)}</a>
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
