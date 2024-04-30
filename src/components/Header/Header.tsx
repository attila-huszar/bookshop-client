import { StyledHeader, ExtraSpace } from './Header.styles'
import { Menu } from './components/Menu/Menu'
import { Search } from './components/Search/Search'
import { Account } from './components/Account/Account'
import { Favorite } from './components/Favorite/Favorite'
import { BasketButton } from './components'

export function Header() {
  return (
    <>
      <ExtraSpace />
      <StyledHeader>
        <Menu />
        <Search />
        <Account />
        <Favorite />
        <BasketButton />
      </StyledHeader>
    </>
  )
}
