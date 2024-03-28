import { StyledHeader } from './Header.styles'
import { StyledButton } from '../../components'
import { Menu } from './components/Menu/Menu'
import { Search } from './components/Search/Search'
import { Account } from './components/Account/Account'
import { Favorite } from './components/Favorite/Favorite'
import cartIcon from '../../assets/svg/cart.svg'

export function Header() {
  return (
    <StyledHeader>
      <Menu />
      <Search />
      <Account />
      <Favorite />
      <StyledButton>
        <img src={cartIcon} alt="cart" />
        Basket
      </StyledButton>
    </StyledHeader>
  )
}
