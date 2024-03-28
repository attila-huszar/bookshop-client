import logo from '../../../../assets/svg/logo.svg'
import { NavList } from '../../Footer.styles'
import { Spacer } from '../../../../styles/Global.styles'

const navLinks: { [key: string]: [string, string] }[] = [
  { about: ['', 'About'] },
  { features: ['', 'Features'] },
  { pricing: ['', 'Pricing'] },
  { gallery: ['', 'Gallery'] },
  { team: ['', 'Team'] },
]

export function Navigation() {
  return (
    <>
      <a href="#top">
        <img src={logo} alt="logo" />
      </a>
      <Spacer />
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
