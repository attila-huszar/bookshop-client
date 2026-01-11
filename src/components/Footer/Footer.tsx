import { Links, Navigation, Subscribe } from './components'
import {
  BottomSection,
  LeftSection,
  RightSection,
  StyledFooter,
} from './Footer.style'

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
