import { Navigation } from './components/Navigation/Navigation'
import { Subscribe } from './components/Subscribe/Subscribe'
import { Links } from './components/Links/Links'
import {
  StyledFooter,
  LeftSection,
  RightSection,
  BottomSection,
} from './Footer.styles'

export function Footer() {
  return (
    <StyledFooter>
      <LeftSection>
        <Navigation />
      </LeftSection>
      <RightSection>
        <Subscribe />
      </RightSection>
      <BottomSection>
        <Links />
      </BottomSection>
    </StyledFooter>
  )
}
