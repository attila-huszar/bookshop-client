import { StyledHeader } from './Header.style'
import { AccountMenu, BasketButton, Menu, Search } from './components'

export function Header() {
  return (
    <StyledHeader>
      <Menu />
      <Search />
      <AccountMenu />
      <BasketButton />
    </StyledHeader>
  )
}
