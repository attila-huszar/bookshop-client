import { NavList } from '../../Footer.styles'
import { SocialLinks } from './Links.styles'
import { legalLinks, socialLinks } from '../../../../lib'

export function Links() {
  return (
    <>
      <NavList>
        {legalLinks.map((el) => (
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
