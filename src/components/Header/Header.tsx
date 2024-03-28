import { StyledHeader } from './Header.styles'
import { Button } from '../../components'
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
      <Button onClick={() => {}}>
        <img src={cartIcon} />
        Basket
      </Button>
    </StyledHeader>
  )
}
