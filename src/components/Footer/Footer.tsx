import {
  StyledFooter,
  StDiv1,
  StDiv2,
  StDiv3,
  NavList,
  SocialsList,
  Spacer,
  SubscribeForm,
} from './Footer.styles'
import logo from '../../assets/svg/logo.svg'
import instagramIcon from '../../assets/svg/instagram.svg'
import googleIcon from '../../assets/svg/google.svg'
import fbIcon from '../../assets/svg/facebook.svg'

export function Footer() {
  return (
    <StyledFooter>
      <StDiv1>
        <img src={logo} alt="logo" />
        <Spacer />
        <NavList>
          <li>About</li>
          <li>Features</li>
          <li>Pricing</li>
          <li>Gallery</li>
          <li>Team</li>
        </NavList>
      </StDiv1>
      <StDiv2>
        <p>
          Subscribe to stay tuned for new product and latest updates. Let's do
          it!
        </p>
        <Spacer />
        <SubscribeForm>
          <input type="text" placeholder="Enter your email address" />
          <button type="button">Subscribe</button>
        </SubscribeForm>
      </StDiv2>
      <StDiv3>
        <NavList>
          <li>Privacy Policy</li>
          <li>Terms of Use</li>
          <li>Sales and Refunds</li>
          <li>Legal</li>
        </NavList>
        <SocialsList>
          <img src={instagramIcon} alt="instagram"></img>
          <img src={googleIcon} alt="google"></img>
          <img src={fbIcon} alt="facebook"></img>
        </SocialsList>
      </StDiv3>
    </StyledFooter>
  )
}
