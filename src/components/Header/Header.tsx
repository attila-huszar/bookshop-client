import { StyledHeader, ExtraSpace } from './Header.styles'
import { Button } from '../../components'
import { Menu } from './components/Menu/Menu'
import { Search } from './components/Search/Search'
import { Account } from './components/Account/Account'
import { Favorite } from './components/Favorite/Favorite'

export function Header() {
  return (
    <>
      <ExtraSpace />
      <StyledHeader>
        <Menu />
        <Search />
        <Account />
        <Favorite />
        <Button onClick={() => {}} $withCart title="Basket">
          Basket
        </Button>
      </StyledHeader>
    </>
  )
}
