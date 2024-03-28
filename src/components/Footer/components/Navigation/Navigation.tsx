import { NavList } from '../../Footer.styles'
import { navLinks } from '../../../../lib/navLinks'
import { StyledLogo } from './Navigation.styles'
import logo from '../../../../assets/svg/logo.svg'

export function Navigation() {
  return (
    <>
      <StyledLogo>
        <a href="#top">
          <img src={logo} alt="logo" />
        </a>
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
