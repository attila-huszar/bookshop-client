import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { scrollToTop } from '@/helpers/scrollToTop'
import { navLinks } from '@/constants/links'
import logo from '@/assets/image/logo.png'
import { NavList, StyledLogo } from './Navigation.style'

export function Navigation() {
  const { t } = useTranslation()

  return (
    <>
      <StyledLogo>
        <Link to="/" onClick={() => scrollToTop()}>
          <img src={logo} alt="Bookshop" />
        </Link>
      </StyledLogo>
      <NavList>
        {navLinks.map((link) => (
          <li key={link.key}>
            <a href={link.path}>{t(link.name)}</a>
          </li>
        ))}
      </NavList>
    </>
  )
}
