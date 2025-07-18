import { Link } from 'react-router'
import { StyledLogo, NavList } from './Navigation.style'
import { navLinks } from '@/constants'
import logo from '@/assets/image/logo.png'

export function Navigation() {
  return (
    <>
      <StyledLogo>
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth',
            })
          }}>
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
