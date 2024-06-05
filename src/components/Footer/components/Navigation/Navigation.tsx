import { Link } from 'react-router-dom'
import { NavList } from '../../Footer.styles'
import { StyledLogo } from './Navigation.styles'
import { navLinks } from 'lib'
import logo from 'assets/image/logo.png'

export function Navigation() {
  return (
    <>
      <StyledLogo>
        <Link
          to="/"
          onClick={() => {
            window.scroll({
              top: 0,
              left: 0,
              behavior: 'smooth',
            })
          }}>
          <img src={logo} alt="logo" />
        </Link>
      </StyledLogo>
      <NavList>
        {navLinks.map((el) => (
          <li key={Object.keys(el)[0]}>
            <a href={Object.values(el)[0][0]}>{Object.values(el)[0][1]}</a>
          </li>
        ))}
      </NavList>
    </>
  )
}
