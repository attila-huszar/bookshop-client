import { Navigation } from './components/Navigation/Navigation'
import { Subscribe } from './components/Subscribe/Subscribe'
import { Links } from './components/Links/Links'
import {
  StyledFooter,
  FooterLeft,
  FooterRight,
  FooterBottom,
} from './Footer.styles'

export function Footer() {
  return (
    <StyledFooter>
      <FooterLeft>
        <Navigation />
      </FooterLeft>
      <FooterRight>
        <Subscribe />
      </FooterRight>
      <FooterBottom>
        <Links />
      </FooterBottom>
    </StyledFooter>
  )
}
