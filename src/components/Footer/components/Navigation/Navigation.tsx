import { Link } from 'react-router'
import { scrollToTop } from '@/helpers'
import { navLinks } from '@/constants'
import logo from '@/assets/image/logo.png'
import { NavList, StyledLogo } from './Navigation.style'

export function Navigation() {
  return (
    <>
      <StyledLogo>
        <Link to="/" onClick={() => scrollToTop()}>
          <img src={logo} alt="logo" />
        </Link>
      </StyledLogo>
      <NavList>
        {navLinks.map((link) => (
          <li key={link.key}>
            <a href={link.path}>{link.name}</a>
          </li>
        ))}
      </NavList>
    </>
  )
}
